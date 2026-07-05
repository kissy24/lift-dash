import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  path.resolve(process.cwd(), 'supabase/migrations/20260705190000_create_presets.sql'),
  'utf8'
)

describe('presets migration', () => {
  it('creates constrained preset tables with cascade relationships', () => {
    expect(migration).toContain('create table public.presets')
    expect(migration).toContain('create table public.preset_items')
    expect(migration).toContain('references public.presets(id) on delete cascade')
    expect(migration).toContain('references public.exercises(id) on delete cascade')
    expect(migration).toContain('unique (preset_id, exercise_id)')
  })

  it('protects both tables with authenticated aal2 RLS', () => {
    expect(migration.match(/enable row level security/g)).toHaveLength(2)
    expect(migration.match(/as restrictive/g)).toHaveLength(2)
    expect(migration).toContain('revoke all on table public.presets from anon')
    expect(migration).toContain('revoke all on table public.preset_items from anon')
  })

  it('defines atomic security-invoker create and update functions', () => {
    expect(migration).toContain('function public.create_preset')
    expect(migration).toContain('function public.update_preset')
    expect(migration.match(/security invoker/g)).toHaveLength(2)
    expect(migration).toContain('jsonb_to_recordset')
    expect(migration).toContain('delete from public.preset_items')
  })
})
