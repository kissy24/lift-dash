create or replace function public.update_workout_session(
  p_session_id uuid,
  p_date date,
  p_notes text,
  p_sets jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  session_updated boolean;
begin
  if jsonb_typeof(p_sets) <> 'array' or jsonb_array_length(p_sets) = 0 then
    raise exception 'At least one workout set is required' using errcode = '23514';
  end if;

  update public.workout_sessions
  set date = p_date, notes = nullif(btrim(p_notes), '')
  where id = p_session_id
  returning true into session_updated;

  if session_updated is not true then
    raise exception 'Workout session not found' using errcode = 'P0002';
  end if;

  delete from public.workout_sets where session_id = p_session_id;

  insert into public.workout_sets (
    session_id,
    exercise_id,
    set_number,
    weight,
    reps
  )
  select
    p_session_id,
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

  return true;
end;
$$;

revoke all on function public.update_workout_session(uuid, date, text, jsonb) from public;
revoke all on function public.update_workout_session(uuid, date, text, jsonb) from anon;
revoke all on function public.update_workout_session(uuid, date, text, jsonb) from authenticated;
grant execute on function public.update_workout_session(uuid, date, text, jsonb) to authenticated;

create or replace function public.delete_workout_set(
  p_set_id uuid,
  p_session_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  set_count int;
  set_deleted boolean;
begin
  perform 1
  from public.workout_sessions
  where id = p_session_id
  for update;

  if not found then
    raise exception 'Workout session not found' using errcode = 'P0002';
  end if;

  select count(*) into set_count
  from public.workout_sets
  where session_id = p_session_id;

  if set_count <= 1 then
    raise exception 'A workout session must contain at least one set' using errcode = 'P0001';
  end if;

  delete from public.workout_sets
  where id = p_set_id and session_id = p_session_id
  returning true into set_deleted;

  if set_deleted is not true then
    raise exception 'Workout set not found' using errcode = 'P0002';
  end if;

  with renumbered as (
    select
      id,
      row_number() over (partition by exercise_id order by set_number, created_at)::int as new_number
    from public.workout_sets
    where session_id = p_session_id
  )
  update public.workout_sets as workout_set
  set set_number = renumbered.new_number
  from renumbered
  where workout_set.id = renumbered.id;

  return true;
end;
$$;

revoke all on function public.delete_workout_set(uuid, uuid) from public;
revoke all on function public.delete_workout_set(uuid, uuid) from anon;
revoke all on function public.delete_workout_set(uuid, uuid) from authenticated;
grant execute on function public.delete_workout_set(uuid, uuid) to authenticated;
