import { describe, expect, it, vi } from 'vitest'

import { getPreviousValuesByExercise } from './workout'

type SupabaseClientParameter = Parameters<typeof getPreviousValuesByExercise>[0]

describe('getPreviousValuesByExercise', () => {
  it('fetches target exercises in a single workout_sets query', async () => {
    const orderSetNumber = vi.fn().mockResolvedValue({
      data: [
        {
          exercise_id: 'bench',
          set_number: 1,
          weight: 60,
          reps: 10,
          workout_sessions: { date: '2026-07-01', created_at: '2026-07-01T09:00:00Z' },
        },
      ],
      error: null,
    })
    const orderExercise = vi.fn().mockReturnValue({ order: orderSetNumber })
    const inExerciseIds = vi.fn().mockReturnValue({ order: orderExercise })
    const select = vi.fn().mockReturnValue({ in: inExerciseIds })
    const from = vi.fn().mockReturnValue({ select })
    const supabase = { from } as unknown as SupabaseClientParameter

    await expect(getPreviousValuesByExercise(supabase, ['bench', 'squat'])).resolves.toEqual({
      bench: { sets: [{ weight: 60, reps: 10 }] },
    })

    expect(from).toHaveBeenCalledOnce()
    expect(from).toHaveBeenCalledWith('workout_sets')
    expect(inExerciseIds).toHaveBeenCalledWith('exercise_id', ['bench', 'squat'])
  })

  it('skips the query when there are no target exercises', async () => {
    const from = vi.fn()
    const supabase = { from } as unknown as SupabaseClientParameter

    await expect(getPreviousValuesByExercise(supabase, [])).resolves.toEqual({})

    expect(from).not.toHaveBeenCalled()
  })

  it('throws a safe error when previous values cannot be loaded', async () => {
    const orderSetNumber = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'database detail' },
    })
    const orderExercise = vi.fn().mockReturnValue({ order: orderSetNumber })
    const inExerciseIds = vi.fn().mockReturnValue({ order: orderExercise })
    const select = vi.fn().mockReturnValue({ in: inExerciseIds })
    const from = vi.fn().mockReturnValue({ select })
    const supabase = { from } as unknown as SupabaseClientParameter

    await expect(getPreviousValuesByExercise(supabase, ['bench'])).rejects.toThrow(
      '前回実績値を取得できませんでした'
    )
  })
})
