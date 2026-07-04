import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  path.resolve(process.cwd(), 'supabase/migrations/20260627184631_create_exercises.sql'),
  'utf8'
)

describe('exercises migration', () => {
  it('creates the constrained exercises table with RLS enabled', () => {
    expect(migration).toContain('create table public.exercises')
    expect(migration).toContain('alter table public.exercises enable row level security')
    expect(migration).toContain("muscle_group in ('chest', 'back', 'legs'")
  })

  it('requires aal2 with a restrictive policy', () => {
    expect(migration).toContain('as restrictive')
    expect(migration).toContain("(select auth.jwt()->>'aal') = 'aal2'")
  })

  it('does not grant table access to the anon role', () => {
    expect(migration).toContain('revoke all on table public.exercises from anon')
    expect(migration).not.toContain('grant all on table public.exercises to anon')
  })
})
