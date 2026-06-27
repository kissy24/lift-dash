create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  muscle_group text not null check (muscle_group in ('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_exercises_updated_at
before update on public.exercises
for each row
execute function public.set_updated_at();

alter table public.exercises enable row level security;

revoke all on table public.exercises from anon;
grant select, insert, update, delete on table public.exercises to authenticated;

create policy "authenticated_full_access"
on public.exercises
as permissive
for all
to authenticated
using (true)
with check (true);

create policy "mfa_required"
on public.exercises
as restrictive
for all
to authenticated
using ((select auth.jwt()->>'aal') = 'aal2')
with check ((select auth.jwt()->>'aal') = 'aal2');
