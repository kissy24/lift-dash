import Link from 'next/link'

import type { WorkoutCalendar as WorkoutCalendarView } from '@/lib/workouts/calendar'

type WorkoutCalendarProps = {
  calendar: WorkoutCalendarView
}

const WEEKDAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

export function WorkoutCalendar({ calendar }: WorkoutCalendarProps) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
          href={calendar.previousMonthHref}
        >
          前月
        </Link>
        <h2 className="text-xl font-semibold">{calendar.label}</h2>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
          href={calendar.nextMonthHref}
        >
          翌月
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-2 grid gap-1 sm:gap-2">
        {calendar.weeks.map((week) => (
          <div
            className="grid grid-cols-7 gap-1 sm:gap-2"
            key={week.map((day) => day.date).join('-')}
          >
            {week.map((day) => (
              <div
                aria-label={day.date}
                className={
                  day.isCurrentMonth
                    ? 'min-h-20 rounded-lg border bg-background p-1.5 text-sm sm:min-h-24 sm:p-2'
                    : 'min-h-20 rounded-lg border bg-muted/30 p-1.5 text-sm text-muted-foreground sm:min-h-24 sm:p-2'
                }
                key={day.date}
              >
                {day.href ? (
                  <Link
                    aria-label={`${day.date} ${day.summary?.sessionCount ?? 0}セッション`}
                    className="block h-full rounded-md bg-primary/10 p-1.5 text-left transition-colors hover:bg-primary/15"
                    href={day.href}
                  >
                    <span className="font-semibold">{day.dayOfMonth}</span>
                    <span className="mt-2 block text-xs font-medium text-primary">
                      {day.summary?.sessionCount ?? 0}セッション
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {day.summary?.setCount ?? 0}セット
                    </span>
                  </Link>
                ) : (
                  <span className="font-medium">{day.dayOfMonth}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
