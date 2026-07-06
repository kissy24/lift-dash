import { describe, expect, it } from 'vitest'

import { presetToWorkoutExercises } from './preset-defaults'

describe('presetToWorkoutExercises', () => {
  it('sorts items and expands each default set', () => {
    expect(
      presetToWorkoutExercises({
        id: 'preset-1',
        name: '全身',
        items: [
          {
            exerciseId: 'exercise-2',
            orderIndex: 1,
            defaultWeight: 100,
            defaultReps: 5,
            defaultSets: 2,
          },
          {
            exerciseId: 'exercise-1',
            orderIndex: 0,
            defaultWeight: 60,
            defaultReps: 10,
            defaultSets: 3,
          },
        ],
      })
    ).toEqual([
      {
        exerciseId: 'exercise-1',
        sets: [
          { weight: 60, reps: 10 },
          { weight: 60, reps: 10 },
          { weight: 60, reps: 10 },
        ],
      },
      {
        exerciseId: 'exercise-2',
        sets: [
          { weight: 100, reps: 5 },
          { weight: 100, reps: 5 },
        ],
      },
    ])
  })

  it('falls back to manual entry defaults for nullable values', () => {
    expect(
      presetToWorkoutExercises({
        id: 'preset-1',
        name: '自重',
        items: [
          {
            exerciseId: 'exercise-1',
            orderIndex: 0,
            defaultWeight: null,
            defaultReps: null,
            defaultSets: 1,
          },
        ],
      })
    ).toEqual([{ exerciseId: 'exercise-1', sets: [{ weight: 0, reps: 1 }] }])
  })

  it('does not share set objects that could mutate sibling sets', () => {
    const exercises = presetToWorkoutExercises({
      id: 'preset-1',
      name: '胸',
      items: [
        {
          exerciseId: 'exercise-1',
          orderIndex: 0,
          defaultWeight: 60,
          defaultReps: 10,
          defaultSets: 2,
        },
      ],
    })
    const sets = exercises[0]?.sets
    expect(sets?.[0]).not.toBe(sets?.[1])
  })
})
