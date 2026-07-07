export type WorkoutPreviousValues = Record<
  string,
  {
    sets: Array<{ weight: number; reps: number }>
  }
>

export type PreviousWorkoutSetRow = {
  exercise_id: string
  set_number: number
  weight: number | string
  reps: number
  workout_sessions:
    | {
        date: string
        created_at: string
      }
    | Array<{
        date: string
        created_at: string
      }>
    | null
}

type LatestExerciseSession = {
  date: string
  createdAt: string
  rows: PreviousWorkoutSetRow[]
}

export function buildPreviousValuesByExercise(
  rows: PreviousWorkoutSetRow[]
): WorkoutPreviousValues {
  const latestByExercise = new Map<string, LatestExerciseSession>()

  rows.forEach((row) => {
    const session = normalizeSession(row.workout_sessions)
    if (!session) return

    const current = latestByExercise.get(row.exercise_id)
    if (!current || isLaterSession(session, current)) {
      latestByExercise.set(row.exercise_id, {
        date: session.date,
        createdAt: session.createdAt,
        rows: [row],
      })
      return
    }

    if (session.date === current.date && session.createdAt === current.createdAt) {
      current.rows.push(row)
    }
  })

  return Object.fromEntries(
    [...latestByExercise.entries()].map(([exerciseId, session]) => [
      exerciseId,
      {
        sets: [...session.rows]
          .sort((a, b) => a.set_number - b.set_number)
          .map((row) => ({ weight: Number(row.weight), reps: row.reps })),
      },
    ])
  )
}

function normalizeSession(
  session: PreviousWorkoutSetRow['workout_sessions']
): { date: string; createdAt: string } | null {
  const normalized = Array.isArray(session) ? session[0] : session
  if (!normalized) return null
  return { date: normalized.date, createdAt: normalized.created_at }
}

function isLaterSession(
  candidate: { date: string; createdAt: string },
  current: LatestExerciseSession
): boolean {
  if (candidate.date !== current.date) return candidate.date > current.date
  return candidate.createdAt > current.createdAt
}
