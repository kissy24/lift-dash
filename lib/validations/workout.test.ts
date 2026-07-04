import { describe, expect, it } from 'vitest'

import { workoutSessionSchema } from './workout'

const EXERCISE_ID = '5f768f8b-91b9-473a-aeca-3d1934e26a8f'

describe('workoutSessionSchema', () => {
  it('parses a session with trimmed notes and numeric form values', () => {
    const result = workoutSessionSchema.parse({
      date: '2026-07-04',
      notes: '  胸の日  ',
      exercises: [
        {
          exerciseId: EXERCISE_ID,
          sets: [{ weight: '60.5', reps: '10' }],
        },
      ],
    })

    expect(result).toEqual({
      date: '2026-07-04',
      notes: '胸の日',
      exercises: [
        {
          exerciseId: EXERCISE_ID,
          sets: [{ weight: 60.5, reps: 10 }],
        },
      ],
    })
  })

  it('accepts zero weight for bodyweight exercises', () => {
    const result = workoutSessionSchema.safeParse({
      date: '2026-07-04',
      notes: '',
      exercises: [{ exerciseId: EXERCISE_ID, sets: [{ weight: 0, reps: 20 }] }],
    })

    expect(result.success).toBe(true)
  })

  it.each([
    ['an impossible date', '2026-02-30'],
    ['a malformed date', '07/04/2026'],
  ])('rejects %s', (_description, date) => {
    const result = workoutSessionSchema.safeParse({
      date,
      notes: '',
      exercises: [{ exerciseId: EXERCISE_ID, sets: [{ weight: 60, reps: 10 }] }],
    })

    expect(result.success).toBe(false)
  })

  it('requires at least one exercise and one set', () => {
    expect(
      workoutSessionSchema.safeParse({ date: '2026-07-04', notes: '', exercises: [] }).success
    ).toBe(false)
    expect(
      workoutSessionSchema.safeParse({
        date: '2026-07-04',
        notes: '',
        exercises: [{ exerciseId: EXERCISE_ID, sets: [] }],
      }).success
    ).toBe(false)
  })

  it('rejects duplicate exercises and invalid set values', () => {
    const result = workoutSessionSchema.safeParse({
      date: '2026-07-04',
      notes: '',
      exercises: [
        { exerciseId: EXERCISE_ID, sets: [{ weight: -1, reps: 0 }] },
        { exerciseId: EXERCISE_ID, sets: [{ weight: 60, reps: 10 }] },
      ],
    })

    expect(result.success).toBe(false)
  })
})
