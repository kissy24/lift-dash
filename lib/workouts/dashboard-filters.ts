import { format, startOfDay, subDays, subYears } from 'date-fns'

import type { MuscleGroup } from '@/lib/supabase/database.types'

export const DASHBOARD_RANGE_OPTIONS = [
  { value: '30d', label: '直近30日' },
  { value: '90d', label: '90日' },
  { value: '180d', label: '180日' },
  { value: '1y', label: '1年' },
  { value: 'all', label: '全期間' },
] as const

export type DashboardRange = (typeof DASHBOARD_RANGE_OPTIONS)[number]['value']

export type DashboardFiltersValue = {
  range: DashboardRange
  exerciseId: string | null
}

export type DashboardFilterQuery = {
  range?: string | string[]
  exercise?: string | string[]
}

export type DashboardFilterWorkoutSession = {
  id: string
  date: string
  created_at: string
  workout_sets: Array<{
    id: string
    weight: number
    reps: number
    created_at: string
    exercises: {
      id: string
      name: string
      muscle_group: MuscleGroup
    } | null
  }>
}

export type FilterDashboardSessionsResult = {
  sessions: DashboardFilterWorkoutSession[]
  startDate: string
  endDate: string
}

const RANGE_VALUES = new Set<DashboardRange>(DASHBOARD_RANGE_OPTIONS.map((option) => option.value))

export function parseDashboardFilters(
  query: DashboardFilterQuery,
  exerciseIds: string[]
): DashboardFiltersValue {
  const range = isDashboardRange(query.range) ? query.range : '30d'
  const exerciseId =
    typeof query.exercise === 'string' && exerciseIds.includes(query.exercise)
      ? query.exercise
      : null

  return { range, exerciseId }
}

export function filterDashboardSessions(
  sessions: DashboardFilterWorkoutSession[],
  filters: DashboardFiltersValue,
  referenceDate: Date = new Date()
): FilterDashboardSessionsResult {
  const endDate = format(startOfDay(referenceDate), 'yyyy-MM-dd')
  const fixedStartDate = startDateForRange(filters.range, referenceDate)
  const sessionsInRange = sessions.filter(
    (session) =>
      session.date <= endDate && (fixedStartDate === null || session.date >= fixedStartDate)
  )
  const filteredSessions = sessionsInRange
    .map((session) => ({
      ...session,
      workout_sets:
        filters.exerciseId === null
          ? session.workout_sets
          : session.workout_sets.filter(
              (workoutSet) => workoutSet.exercises?.id === filters.exerciseId
            ),
    }))
    .filter((session) => filters.exerciseId === null || session.workout_sets.length > 0)
  const startDate =
    fixedStartDate ??
    filteredSessions.reduce(
      (earliest, session) => (session.date < earliest ? session.date : earliest),
      endDate
    )

  return { sessions: filteredSessions, startDate, endDate }
}

function isDashboardRange(value: string | string[] | undefined): value is DashboardRange {
  return typeof value === 'string' && RANGE_VALUES.has(value as DashboardRange)
}

function startDateForRange(range: DashboardRange, referenceDate: Date): string | null {
  const end = startOfDay(referenceDate)

  switch (range) {
    case '30d':
      return format(subDays(end, 29), 'yyyy-MM-dd')
    case '90d':
      return format(subDays(end, 89), 'yyyy-MM-dd')
    case '180d':
      return format(subDays(end, 179), 'yyyy-MM-dd')
    case '1y':
      return format(subYears(end, 1), 'yyyy-MM-dd')
    case 'all':
      return null
  }
}
