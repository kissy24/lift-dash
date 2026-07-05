import { describe, expect, it } from 'vitest'

import { summarizeWorkoutDates } from './summarize-workout-dates'

describe('summarizeWorkoutDates', () => {
  it('groups sessions by date and calculates set count and volume', () => {
    expect(
      summarizeWorkoutDates([
        { date: '2026-07-04', workout_sets: [{ weight: 60, reps: 10 }] },
        {
          date: '2026-07-05',
          workout_sets: [
            { weight: 100, reps: 5 },
            { weight: 0, reps: 20 },
          ],
        },
        { date: '2026-07-04', workout_sets: [{ weight: 40, reps: 12 }] },
      ])
    ).toEqual([
      { date: '2026-07-05', sessionCount: 1, setCount: 2, volume: 500 },
      { date: '2026-07-04', sessionCount: 2, setCount: 2, volume: 1080 },
    ])
  })

  it('returns an empty list when no sessions exist', () => {
    expect(summarizeWorkoutDates([])).toEqual([])
  })
})
