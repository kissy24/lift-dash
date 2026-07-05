import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  path.resolve(process.cwd(), 'supabase/migrations/20260705160000_manage_workouts.sql'),
  'utf8'
)

describe('workout management migration', () => {
  it('atomically replaces a session and all of its sets', () => {
    expect(migration).toContain('function public.update_workout_session')
    expect(migration).toContain('security invoker')
    expect(migration).toContain('update public.workout_sessions')
    expect(migration).toContain('delete from public.workout_sets')
    expect(migration).toContain('insert into public.workout_sets')
  })

  it('prevents deleting the last set in a session', () => {
    expect(migration).toContain('function public.delete_workout_set')
    expect(migration).toContain('for update')
    expect(migration).toContain('A workout session must contain at least one set')
    expect(migration).toContain('row_number() over (partition by exercise_id')
  })

  it('only grants execution to authenticated users', () => {
    expect(migration.match(/revoke all on function/g)).toHaveLength(6)
    expect(migration.match(/grant execute on function/g)).toHaveLength(2)
  })
})
