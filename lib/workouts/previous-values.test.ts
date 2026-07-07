import { describe, expect, it } from 'vitest'

import { buildPreviousValuesByExercise } from './previous-values'

describe('buildPreviousValuesByExercise', () => {
  it('keeps the latest session per exercise by date and created_at', () => {
    expect(
      buildPreviousValuesByExercise([
        {
          exercise_id: 'bench',
          set_number: 1,
          weight: '60.5',
          reps: 10,
          workout_sessions: { date: '2026-07-01', created_at: '2026-07-01T09:00:00Z' },
        },
        {
          exercise_id: 'bench',
          set_number: 1,
          weight: '62.5',
          reps: 8,
          workout_sessions: { date: '2026-07-04', created_at: '2026-07-04T09:00:00Z' },
        },
        {
          exercise_id: 'bench',
          set_number: 1,
          weight: '65',
          reps: 6,
          workout_sessions: { date: '2026-07-04', created_at: '2026-07-04T12:00:00Z' },
        },
      ])
    ).toEqual({
      bench: { sets: [{ weight: 65, reps: 6 }] },
    })
  })

  it('sorts sets by set number and preserves every set from the latest session', () => {
    expect(
      buildPreviousValuesByExercise([
        {
          exercise_id: 'squat',
          set_number: 2,
          weight: 102.5,
          reps: 5,
          workout_sessions: { date: '2026-07-03', created_at: '2026-07-03T09:00:00Z' },
        },
        {
          exercise_id: 'squat',
          set_number: 1,
          weight: 100,
          reps: 5,
          workout_sessions: { date: '2026-07-03', created_at: '2026-07-03T09:00:00Z' },
        },
      ])
    ).toEqual({
      squat: {
        sets: [
          { weight: 100, reps: 5 },
          { weight: 102.5, reps: 5 },
        ],
      },
    })
  })

  it('builds previous values independently for multiple exercises', () => {
    expect(
      buildPreviousValuesByExercise([
        {
          exercise_id: 'bench',
          set_number: 1,
          weight: 60,
          reps: 10,
          workout_sessions: { date: '2026-07-01', created_at: '2026-07-01T09:00:00Z' },
        },
        {
          exercise_id: 'squat',
          set_number: 1,
          weight: 100,
          reps: 5,
          workout_sessions: { date: '2026-07-02', created_at: '2026-07-02T09:00:00Z' },
        },
      ])
    ).toEqual({
      bench: { sets: [{ weight: 60, reps: 10 }] },
      squat: { sets: [{ weight: 100, reps: 5 }] },
    })
  })
})
