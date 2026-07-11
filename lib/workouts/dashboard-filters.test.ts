import { describe, expect, it } from 'vitest'

import {
  filterDashboardSessions,
  parseDashboardFilters,
  type DashboardFilterWorkoutSession,
} from './dashboard-filters'

const SESSIONS: DashboardFilterWorkoutSession[] = [
  {
    id: 'session-old',
    date: '2026-05-01',
    created_at: '2026-05-01T09:00:00Z',
    workout_sets: [
      {
        id: 'set-old',
        weight: 70,
        reps: 8,
        created_at: '2026-05-01T09:01:00Z',
        exercises: { id: 'bench', name: 'ベンチプレス', muscle_group: 'chest' },
      },
    ],
  },
  {
    id: 'session-recent',
    date: '2026-07-05',
    created_at: '2026-07-05T09:00:00Z',
    workout_sets: [
      {
        id: 'set-bench',
        weight: 80,
        reps: 6,
        created_at: '2026-07-05T09:01:00Z',
        exercises: { id: 'bench', name: 'ベンチプレス', muscle_group: 'chest' },
      },
      {
        id: 'set-squat',
        weight: 120,
        reps: 3,
        created_at: '2026-07-05T09:02:00Z',
        exercises: { id: 'squat', name: 'スクワット', muscle_group: 'legs' },
      },
    ],
  },
]

describe('parseDashboardFilters', () => {
  it('accepts supported ranges and known exercise ids', () => {
    expect(parseDashboardFilters({ range: '90d', exercise: 'bench' }, ['bench', 'squat'])).toEqual({
      range: '90d',
      exerciseId: 'bench',
    })
  })

  it('falls back safely for invalid or repeated query values', () => {
    expect(
      parseDashboardFilters({ range: 'invalid', exercise: 'missing' }, ['bench', 'squat'])
    ).toEqual({ range: '30d', exerciseId: null })
    expect(
      parseDashboardFilters({ range: ['90d', 'all'], exercise: ['bench'] }, ['bench'])
    ).toEqual({ range: '30d', exerciseId: null })
  })
})

describe('filterDashboardSessions', () => {
  it('filters sessions by an inclusive date range', () => {
    const result = filterDashboardSessions(
      SESSIONS,
      { range: '30d', exerciseId: null },
      new Date('2026-07-10T12:00:00Z')
    )

    expect(result.startDate).toBe('2026-06-11')
    expect(result.endDate).toBe('2026-07-10')
    expect(result.sessions.map((session) => session.id)).toEqual(['session-recent'])
  })

  it('keeps only the selected exercise sets for every dashboard consumer', () => {
    const result = filterDashboardSessions(
      SESSIONS,
      { range: 'all', exerciseId: 'squat' },
      new Date('2026-07-10T12:00:00Z')
    )

    expect(result.startDate).toBe('2026-07-05')
    expect(result.sessions).toHaveLength(1)
    expect(result.sessions[0]?.workout_sets.map((set) => set.exercises?.id)).toEqual(['squat'])
  })

  it('uses the reference date as the all-range start when there are no matching sessions', () => {
    const result = filterDashboardSessions(
      [],
      { range: 'all', exerciseId: null },
      new Date('2026-07-10T12:00:00Z')
    )

    expect(result).toEqual({ sessions: [], startDate: '2026-07-10', endDate: '2026-07-10' })
  })
})
