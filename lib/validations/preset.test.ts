import { describe, expect, it } from 'vitest'

import { deletePresetSchema, presetSchema, updatePresetSchema } from './preset'

const EXERCISE_ID = '5f768f8b-91b9-473a-aeca-3d1934e26a8f'
const SECOND_EXERCISE_ID = '2b994e6c-2e61-4dc1-a1b2-b641868c07c8'

describe('presetSchema', () => {
  it('parses trimmed names, nullable defaults and ordered items', () => {
    expect(
      presetSchema.parse({
        name: ' 胸の日 ',
        items: [
          {
            exerciseId: EXERCISE_ID,
            defaultWeight: '60.5',
            defaultReps: '10',
            defaultSets: '3',
          },
          {
            exerciseId: SECOND_EXERCISE_ID,
            defaultWeight: null,
            defaultReps: null,
            defaultSets: 4,
          },
        ],
      })
    ).toEqual({
      name: '胸の日',
      items: [
        { exerciseId: EXERCISE_ID, defaultWeight: 60.5, defaultReps: 10, defaultSets: 3 },
        {
          exerciseId: SECOND_EXERCISE_ID,
          defaultWeight: null,
          defaultReps: null,
          defaultSets: 4,
        },
      ],
    })
  })

  it('requires a name and at least one item', () => {
    expect(presetSchema.safeParse({ name: '', items: [] }).success).toBe(false)
  })

  it('rejects duplicate exercises', () => {
    const item = {
      exerciseId: EXERCISE_ID,
      defaultWeight: 60,
      defaultReps: 10,
      defaultSets: 3,
    }

    expect(presetSchema.safeParse({ name: '胸の日', items: [item, item] }).success).toBe(false)
  })

  it('rejects out-of-range default values', () => {
    expect(
      presetSchema.safeParse({
        name: '胸の日',
        items: [
          {
            exerciseId: EXERCISE_ID,
            defaultWeight: -1,
            defaultReps: 0,
            defaultSets: 21,
          },
        ],
      }).success
    ).toBe(false)
  })
})

describe('preset mutation schemas', () => {
  it('requires UUIDs for update and delete', () => {
    expect(
      updatePresetSchema.safeParse({
        id: 'invalid',
        name: '胸の日',
        items: [
          {
            exerciseId: EXERCISE_ID,
            defaultWeight: null,
            defaultReps: null,
            defaultSets: 3,
          },
        ],
      }).success
    ).toBe(false)
    expect(deletePresetSchema.safeParse({ id: 'invalid' }).success).toBe(false)
  })
})
