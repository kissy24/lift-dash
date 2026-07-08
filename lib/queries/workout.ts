import type { createClient } from '@/lib/supabase/server'
import {
  buildPreviousValuesByExercise,
  type PreviousWorkoutSetRow,
  type WorkoutPreviousValues,
} from '@/lib/workouts/previous-values'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function getPreviousValuesByExercise(
  supabase: SupabaseServerClient,
  exerciseIds: string[]
): Promise<WorkoutPreviousValues> {
  if (exerciseIds.length === 0) return {}

  const { data, error } = await supabase
    .from('workout_sets')
    .select('exercise_id,set_number,weight,reps,workout_sessions!inner(date,created_at)')
    .in('exercise_id', exerciseIds)
    .order('exercise_id', { ascending: true })
    .order('set_number', { ascending: true })

  if (error) throw new Error('前回実績値を取得できませんでした')

  return buildPreviousValuesByExercise((data ?? []) as PreviousWorkoutSetRow[])
}
