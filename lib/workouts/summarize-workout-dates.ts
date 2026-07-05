type SessionSummaryInput = {
  date: string
  workout_sets: Array<{ weight: number; reps: number }>
}

export type WorkoutDateSummary = {
  date: string
  sessionCount: number
  setCount: number
  volume: number
}

export function summarizeWorkoutDates(sessions: SessionSummaryInput[]): WorkoutDateSummary[] {
  const summaries = new Map<string, WorkoutDateSummary>()

  sessions.forEach((session) => {
    const current = summaries.get(session.date) ?? {
      date: session.date,
      sessionCount: 0,
      setCount: 0,
      volume: 0,
    }
    current.sessionCount += 1
    current.setCount += session.workout_sets.length
    current.volume += session.workout_sets.reduce(
      (total, workoutSet) => total + workoutSet.weight * workoutSet.reps,
      0
    )
    summaries.set(session.date, current)
  })

  return [...summaries.values()].sort((a, b) => b.date.localeCompare(a.date))
}
