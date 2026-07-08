import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  isSameMonth,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

import type { WorkoutDateSummary } from './summarize-workout-dates'

export type WorkoutCalendarDay = {
  date: string
  dayOfMonth: string
  isCurrentMonth: boolean
  href?: string
  summary?: WorkoutDateSummary
}

export type WorkoutCalendar = {
  label: string
  previousMonthHref: string
  nextMonthHref: string
  weeks: WorkoutCalendarDay[][]
}

type BuildWorkoutCalendarInput = {
  visibleMonth: Date
  summaries: WorkoutDateSummary[]
}

export function parseWorkoutCalendarMonth(month: string | undefined, now = new Date()): Date {
  if (month) {
    const parsed = parse(month, 'yyyy-MM', new Date())
    if (isValid(parsed) && format(parsed, 'yyyy-MM') === month) return startOfMonth(parsed)
  }

  return startOfMonth(now)
}

export function buildWorkoutCalendar({
  visibleMonth,
  summaries,
}: BuildWorkoutCalendarInput): WorkoutCalendar {
  const monthStart = startOfMonth(visibleMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 })
  const summariesByDate = new Map(summaries.map((summary) => [summary.date, summary]))
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const summary = summariesByDate.get(formattedDate)
    return {
      date: formattedDate,
      dayOfMonth: format(date, 'd'),
      isCurrentMonth: isSameMonth(date, monthStart),
      ...(summary ? { href: `/log/${formattedDate}`, summary } : {}),
    }
  })

  return {
    label: format(monthStart, 'yyyy年M月'),
    previousMonthHref: `/log?month=${format(addMonths(monthStart, -1), 'yyyy-MM')}`,
    nextMonthHref: `/log?month=${format(addMonths(monthStart, 1), 'yyyy-MM')}`,
    weeks: chunkWeeks(days),
  }
}

function chunkWeeks(days: WorkoutCalendarDay[]): WorkoutCalendarDay[][] {
  return Array.from({ length: Math.ceil(days.length / 7) }, (_, index) =>
    days.slice(index * 7, index * 7 + 7)
  )
}
