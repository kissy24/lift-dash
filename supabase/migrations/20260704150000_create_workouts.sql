create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  set_number int not null check (set_number between 1 and 20),
  weight numeric(6, 2) not null check (weight between 0 and 9999.99),
  reps int not null check (reps between 1 and 9999),
  created_at timestamptz not null default now(),
  unique (session_id, exercise_id, set_number)
);

create index idx_workout_sessions_date on public.workout_sessions(date);
create index idx_workout_sets_session on public.workout_sets(session_id);
create index idx_workout_sets_exercise on public.workout_sets(exercise_id);

create trigger set_workout_sessions_updated_at
before update on public.workout_sessions
for each row
execute function public.set_updated_at();

alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;

revoke all on table public.workout_sessions from anon;
revoke all on table public.workout_sets from anon;
grant select, insert, update, delete on table public.workout_sessions to authenticated;
grant select, insert, update, delete on table public.workout_sets to authenticated;

create policy "authenticated_full_access"
on public.workout_sessions
as permissive
for all
to authenticated
using (true)
with check (true);

create policy "mfa_required"
on public.workout_sessions
as restrictive
for all
to authenticated
using ((select auth.jwt()->>'aal') = 'aal2')
with check ((select auth.jwt()->>'aal') = 'aal2');

create policy "authenticated_full_access"
on public.workout_sets
as permissive
for all
to authenticated
using (true)
with check (true);

create policy "mfa_required"
on public.workout_sets
as restrictive
for all
to authenticated
using ((select auth.jwt()->>'aal') = 'aal2')
with check ((select auth.jwt()->>'aal') = 'aal2');

create or replace function public.create_workout_session(
  p_date date,
  p_notes text,
  p_sets jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_session_id uuid;
begin
  if jsonb_typeof(p_sets) <> 'array' or jsonb_array_length(p_sets) = 0 then
    raise exception 'At least one workout set is required' using errcode = '23514';
  end if;

  insert into public.workout_sessions (date, notes)
  values (p_date, nullif(btrim(p_notes), ''))
  returning id into new_session_id;

  insert into public.workout_sets (
    session_id,
    exercise_id,
    set_number,
    weight,
    reps
  )
  select
    new_session_id,
    workout_set.exercise_id,
    workout_set.set_number,
    workout_set.weight,
    workout_set.reps
  from jsonb_to_recordset(p_sets) as workout_set(
    exercise_id uuid,
    set_number int,
    weight numeric(6, 2),
    reps int
  );

  return new_session_id;
end;
$$;

revoke all on function public.create_workout_session(date, text, jsonb) from public;
revoke all on function public.create_workout_session(date, text, jsonb) from anon;
grant execute on function public.create_workout_session(date, text, jsonb) to authenticated;
