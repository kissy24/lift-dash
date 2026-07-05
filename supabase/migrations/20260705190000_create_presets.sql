create table public.presets (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.preset_items (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  order_index int not null default 0 check (order_index between 0 and 19),
  default_weight numeric(6, 2) check (default_weight between 0 and 9999.99),
  default_reps int check (default_reps between 1 and 9999),
  default_sets int not null default 3 check (default_sets between 1 and 20),
  created_at timestamptz not null default now(),
  unique (preset_id, exercise_id),
  unique (preset_id, order_index)
);

create index idx_preset_items_preset on public.preset_items(preset_id);
create index idx_preset_items_exercise on public.preset_items(exercise_id);

create trigger set_presets_updated_at
before update on public.presets
for each row
execute function public.set_updated_at();

alter table public.presets enable row level security;
alter table public.preset_items enable row level security;

revoke all on table public.presets from anon;
revoke all on table public.preset_items from anon;
grant select, insert, update, delete on table public.presets to authenticated;
grant select, insert, update, delete on table public.preset_items to authenticated;

create policy "authenticated_full_access"
on public.presets
as permissive
for all
to authenticated
using (true)
with check (true);

create policy "mfa_required"
on public.presets
as restrictive
for all
to authenticated
using ((select auth.jwt()->>'aal') = 'aal2')
with check ((select auth.jwt()->>'aal') = 'aal2');

create policy "authenticated_full_access"
on public.preset_items
as permissive
for all
to authenticated
using (true)
with check (true);

create policy "mfa_required"
on public.preset_items
as restrictive
for all
to authenticated
using ((select auth.jwt()->>'aal') = 'aal2')
with check ((select auth.jwt()->>'aal') = 'aal2');

create or replace function public.create_preset(p_name text, p_items jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_preset_id uuid;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one preset item is required' using errcode = '23514';
  end if;

  insert into public.presets (name)
  values (btrim(p_name))
  returning id into new_preset_id;

  insert into public.preset_items (
    preset_id,
    exercise_id,
    order_index,
    default_weight,
    default_reps,
    default_sets
  )
  select
    new_preset_id,
    preset_item.exercise_id,
    preset_item.order_index,
    preset_item.default_weight,
    preset_item.default_reps,
    preset_item.default_sets
  from jsonb_to_recordset(p_items) as preset_item(
    exercise_id uuid,
    order_index int,
    default_weight numeric(6, 2),
    default_reps int,
    default_sets int
  );

  return new_preset_id;
end;
$$;

create or replace function public.update_preset(
  p_preset_id uuid,
  p_name text,
  p_items jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  preset_updated boolean;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one preset item is required' using errcode = '23514';
  end if;

  update public.presets
  set name = btrim(p_name)
  where id = p_preset_id
  returning true into preset_updated;

  if preset_updated is not true then
    raise exception 'Preset not found' using errcode = 'P0002';
  end if;

  delete from public.preset_items where preset_id = p_preset_id;

  insert into public.preset_items (
    preset_id,
    exercise_id,
    order_index,
    default_weight,
    default_reps,
    default_sets
  )
  select
    p_preset_id,
    preset_item.exercise_id,
    preset_item.order_index,
    preset_item.default_weight,
    preset_item.default_reps,
    preset_item.default_sets
  from jsonb_to_recordset(p_items) as preset_item(
    exercise_id uuid,
    order_index int,
    default_weight numeric(6, 2),
    default_reps int,
    default_sets int
  );

  return true;
end;
$$;

revoke all on function public.create_preset(text, jsonb) from public;
revoke all on function public.create_preset(text, jsonb) from anon;
grant execute on function public.create_preset(text, jsonb) to authenticated;

revoke all on function public.update_preset(uuid, text, jsonb) from public;
revoke all on function public.update_preset(uuid, text, jsonb) from anon;
grant execute on function public.update_preset(uuid, text, jsonb) to authenticated;
