import { format, parseISO } from 'date-fns'
import Link from 'next/link'

import { WorkoutCalendar } from '@/components/workouts/WorkoutCalendar'
import { createClient } from '@/lib/supabase/server'
import { buildWorkoutCalendar, parseWorkoutCalendarMonth } from '@/lib/workouts/calendar'
import { summarizeWorkoutDates } from '@/lib/workouts/summarize-workout-dates'

type WorkoutLogPageProps = {
  searchParams?: Promise<{ month?: string | string[] }>
}

export default async function WorkoutLogPage({ searchParams }: WorkoutLogPageProps) {
  const params = await searchParams
  const month = Array.isArray(params?.month) ? params.month[0] : params?.month
  const supabase = await createClient()
  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select('id,date,workout_sets(weight,reps)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error('トレーニング記録を取得できませんでした')

  const summaries = summarizeWorkoutDates(sessions)
  const calendar = buildWorkoutCalendar({
    visibleMonth: parseWorkoutCalendarMonth(month),
    summaries,
  })

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">LiftDash</p>
          <h1 className="text-3xl font-semibold tracking-tight">トレーニング記録</h1>
          <p className="text-sm text-muted-foreground">日付を選んでセッション詳細を確認します。</p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          href="/log/new"
        >
          記録を追加
        </Link>
      </header>

      <div className="mb-8">
        <WorkoutCalendar calendar={calendar} />
      </div>

      {summaries.length > 0 ? (
        <ul className="space-y-4">
          {summaries.map((summary) => (
            <li key={summary.date}>
              <Link
                className="block rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40"
                href={`/log/${summary.date}`}
              >
                <h2 className="text-lg font-semibold">
                  {format(parseISO(summary.date), 'yyyy年M月d日')}
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  <span>{summary.sessionCount}セッション</span>
                  <span>{summary.setCount}セット</span>
                  <span>合計ボリューム {summary.volume.toLocaleString('ja-JP')} kg</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <section className="rounded-xl border bg-card p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">記録がまだありません</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            最初のトレーニングを記録して振り返りを始めましょう。
          </p>
          <Link
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            href="/log/new"
          >
            最初の記録を追加
          </Link>
        </section>
      )}
    </main>
  )
}
