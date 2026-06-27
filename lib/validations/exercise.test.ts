import { describe, expect, it } from 'vitest'

import { exerciseIdSchema, exerciseSchema } from './exercise'

describe('exerciseSchema', () => {
  it('trims and accepts a valid exercise', () => {
    expect(exerciseSchema.parse({ name: '  ベンチプレス  ', muscleGroup: 'chest' })).toEqual({
      name: 'ベンチプレス',
      muscleGroup: 'chest',
    })
  })

  it('rejects an empty name', () => {
    expect(exerciseSchema.safeParse({ name: '   ', muscleGroup: 'chest' }).success).toBe(false)
  })

  it('rejects an unsupported muscle group', () => {
    expect(exerciseSchema.safeParse({ name: 'ベンチプレス', muscleGroup: 'invalid' }).success).toBe(
      false
    )
  })
})

describe('exerciseIdSchema', () => {
  it('accepts a UUID', () => {
    expect(exerciseIdSchema.safeParse('5f768f8b-91b9-473a-aeca-3d1934e26a8f').success).toBe(true)
  })

  it('rejects a non-UUID identifier', () => {
    expect(exerciseIdSchema.safeParse('exercise-1').success).toBe(false)
  })
})
