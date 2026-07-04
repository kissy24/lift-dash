import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  path.resolve(process.cwd(), 'supabase/migrations/20260704150000_create_workouts.sql'),
  'utf8'
)

describe('workout migration', () => {
  it('creates constrained session and set tables with indexes', () => {
    expect(migration).toContain('create table public.workout_sessions')
    expect(migration).toContain('create table public.workout_sets')
    expect(migration).toContain('references public.workout_sessions(id) on delete cascade')
    expect(migration).toContain('unique (session_id, exercise_id, set_number)')
    expect(migration).toContain('create index idx_workout_sessions_date')
  })

  it('protects both tables with authenticated aal2 RLS policies', () => {
    expect(migration.match(/enable row level security/g)).toHaveLength(2)
    expect(migration.match(/as restrictive/g)).toHaveLength(2)
    expect(migration.match(/\(select auth\.jwt\(\)->>'aal'\) = 'aal2'/g)).toHaveLength(4)
    expect(migration).toContain('revoke all on table public.workout_sessions from anon')
    expect(migration).toContain('revoke all on table public.workout_sets from anon')
  })

  it('defines a security-invoker transaction for session and set inserts', () => {
    expect(migration).toContain('function public.create_workout_session')
    expect(migration).toContain('security invoker')
    expect(migration).toContain('insert into public.workout_sessions')
    expect(migration).toContain('insert into public.workout_sets')
    expect(migration).toContain('jsonb_to_recordset')
  })
})
