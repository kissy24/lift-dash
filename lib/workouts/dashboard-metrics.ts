import { eachDayOfInterval, format, parseISO, startOfDay, startOfWeek, subDays } from 'date-fns'

import type { MuscleGroup } from '@/lib/supabase/database.types'

export type DashboardWorkoutSet = {
  id: string
  weight: number
  reps: number
  exercises: {
    id: string
    name: string
    muscle_group: MuscleGroup
  } | null
}

export type DashboardWorkoutSession = {
  id: string
  date: string
  workout_sets: DashboardWorkoutSet[]
}

export type DashboardSeries = {
  exerciseId: string
  exerciseName: string
  points: Array<{ date: string; value: number }>
}

export type DashboardMetrics = {
  maxWeightByExercise: DashboardSeries[]
  volumeByExercise: DashboardSeries[]
  frequency: Array<{ date: string; sessionCount: number }>
  muscleGroupVolumes: Array<{ muscleGroup: MuscleGroup; volume: number }>
  weeklyVolumes: Array<{ weekStart: string; volume: number }>
}

export type BuildDashboardMetricsOptions = {
  referenceDate?: Date
}

type ExerciseBucket = {
  exerciseId: string
  exerciseName: string
  byDate: Map<string, number>
}

export function buildDashboardMetrics(
  sessions: DashboardWorkoutSession[],
  options: BuildDashboardMetricsOptions = {}
): DashboardMetrics {
  const maxWeightBuckets = new Map<string, ExerciseBucket>()
  const volumeBuckets = new Map<string, ExerciseBucket>()
  const frequencyByDate = new Map<string, number>()
  const muscleGroupVolumes = new Map<MuscleGroup, number>()
  const weeklyVolumes = new Map<string, number>()
  const referenceDate = startOfDay(options.referenceDate ?? new Date())
  const recentStart = subDays(referenceDate, 29)

  sessions.forEach((session) => {
    frequencyByDate.set(session.date, (frequencyByDate.get(session.date) ?? 0) + 1)

    session.workout_sets.forEach((workoutSet) => {
      const exercise = workoutSet.exercises
      if (!exercise) return

      const volume = workoutSet.weight * workoutSet.reps
      const weekStart = format(
        startOfWeek(parseISO(session.date), { weekStartsOn: 1 }),
        'yyyy-MM-dd'
      )

      if (isWithinRecentWindow(session.date, recentStart, referenceDate)) {
        muscleGroupVolumes.set(
          exercise.muscle_group,
          (muscleGroupVolumes.get(exercise.muscle_group) ?? 0) + volume
        )
      }
      weeklyVolumes.set(weekStart, (weeklyVolumes.get(weekStart) ?? 0) + volume)

      const maxBucket = bucketFor(maxWeightBuckets, exercise.id, exercise.name)
      maxBucket.byDate.set(
        session.date,
        Math.max(maxBucket.byDate.get(session.date) ?? 0, workoutSet.weight)
      )

      const volumeBucket = bucketFor(volumeBuckets, exercise.id, exercise.name)
      volumeBucket.byDate.set(session.date, (volumeBucket.byDate.get(session.date) ?? 0) + volume)
    })
  })

  return {
    maxWeightByExercise: seriesFromBuckets(maxWeightBuckets),
    volumeByExercise: seriesFromBuckets(volumeBuckets),
    frequency: buildFrequencyDays(frequencyByDate, recentStart, referenceDate),
    muscleGroupVolumes: [...muscleGroupVolumes.entries()]
      .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
      .map(([muscleGroup, volume]) => ({ muscleGroup, volume })),
    weeklyVolumes: [...weeklyVolumes.entries()]
      .sort(([weekA], [weekB]) => weekA.localeCompare(weekB))
      .map(([weekStart, volume]) => ({ weekStart, volume })),
  }
}

function buildFrequencyDays(
  frequencyByDate: Map<string, number>,
  start: Date,
  end: Date
): Array<{ date: string; sessionCount: number }> {
  return eachDayOfInterval({ start, end }).map((date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return { date: dateKey, sessionCount: frequencyByDate.get(dateKey) ?? 0 }
  })
}

function isWithinRecentWindow(date: string, start: Date, end: Date): boolean {
  const parsedDate = parseISO(date)
  return parsedDate >= start && parsedDate <= end
}

function bucketFor(
  buckets: Map<string, ExerciseBucket>,
  exerciseId: string,
  exerciseName: string
): ExerciseBucket {
  const existing = buckets.get(exerciseId)
  if (existing) return existing

  const bucket = {
    exerciseId,
    exerciseName,
    byDate: new Map<string, number>(),
  }
  buckets.set(exerciseId, bucket)
  return bucket
}

function seriesFromBuckets(buckets: Map<string, ExerciseBucket>): DashboardSeries[] {
  return [...buckets.values()]
    .sort((a, b) => a.exerciseId.localeCompare(b.exerciseId))
    .map((bucket) => ({
      exerciseId: bucket.exerciseId,
      exerciseName: bucket.exerciseName,
      points: [...bucket.byDate.entries()]
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, value]) => ({ date, value })),
    }))
}
