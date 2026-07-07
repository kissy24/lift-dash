export type WorkoutPreset = {
  id: string
  name: string
  items: Array<{
    exerciseId: string
    orderIndex: number
    defaultWeight: number | null
    defaultReps: number | null
    defaultSets: number
  }>
}

export type WorkoutExerciseDefaults = {
  exerciseId: string
  sets: Array<{ weight: number; reps: number }>
}

export function presetToWorkoutExercises(preset: WorkoutPreset): WorkoutExerciseDefaults[] {
  return [...preset.items]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((item) => ({
      exerciseId: item.exerciseId,
      sets: Array.from({ length: item.defaultSets }, () => ({
        weight: item.defaultWeight ?? 0,
        reps: item.defaultReps ?? 1,
      })),
    }))
}
