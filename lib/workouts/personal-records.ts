export type PersonalRecordWorkoutSet = {
  id: string
  weight: number
  reps: number
  created_at: string
  exercises: {
    id: string
    name: string
  } | null
}

export type PersonalRecordWorkoutSession = {
  id: string
  date: string
  created_at: string
  workout_sets: PersonalRecordWorkoutSet[]
}

export type PersonalRecord = {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  date: string
}

type PersonalRecordCandidate = PersonalRecord & {
  sessionCreatedAt: string
  setCreatedAt: string
}

export function buildPersonalRecords(sessions: PersonalRecordWorkoutSession[]): PersonalRecord[] {
  const recordsByExercise = new Map<string, PersonalRecordCandidate>()

  sessions.forEach((session) => {
    session.workout_sets.forEach((workoutSet) => {
      const exercise = workoutSet.exercises
      if (!exercise) return

      const candidate: PersonalRecordCandidate = {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        weight: workoutSet.weight,
        reps: workoutSet.reps,
        date: session.date,
        sessionCreatedAt: session.created_at,
        setCreatedAt: workoutSet.created_at,
      }
      const current = recordsByExercise.get(exercise.id)

      if (!current || isNewerPersonalRecord(candidate, current)) {
        recordsByExercise.set(exercise.id, candidate)
      }
    })
  })

  return [...recordsByExercise.values()]
    .sort((a, b) => a.exerciseId.localeCompare(b.exerciseId))
    .map(({ exerciseId, exerciseName, weight, reps, date }) => ({
      exerciseId,
      exerciseName,
      weight,
      reps,
      date,
    }))
}

function isNewerPersonalRecord(
  candidate: PersonalRecordCandidate,
  current: PersonalRecordCandidate
): boolean {
  if (candidate.weight !== current.weight) return candidate.weight > current.weight
  if (candidate.date !== current.date) return candidate.date > current.date
  if (candidate.sessionCreatedAt !== current.sessionCreatedAt) {
    return candidate.sessionCreatedAt > current.sessionCreatedAt
  }
  return candidate.setCreatedAt > current.setCreatedAt
}
