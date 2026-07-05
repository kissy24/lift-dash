export type WorkoutSetView = {
  id: string
  setNumber: number
  weight: number
  reps: number
}

export type WorkoutExerciseView = {
  exerciseId: string
  exerciseName: string
  sets: WorkoutSetView[]
}

export type WorkoutSessionView = {
  id: string
  date: string
  notes: string | null
  exercises: WorkoutExerciseView[]
}
