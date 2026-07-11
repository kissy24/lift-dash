import Link from 'next/link'

import { DashboardCharts } from '@/components/charts/DashboardCharts'
import { LogoutButton } from '@/components/forms/LogoutButton'
import { DashboardFilters } from '@/components/workouts/DashboardFilters'
import { PersonalRecordCards } from '@/components/workouts/PersonalRecordCards'
import { createClient } from '@/lib/supabase/server'
import {
  filterDashboardSessions,
  parseDashboardFilters,
  type DashboardFilterQuery,
  type DashboardFilterWorkoutSession,
} from '@/lib/workouts/dashboard-filters'
import { buildDashboardMetrics } from '@/lib/workouts/dashboard-metrics'
import { buildPersonalRecords } from '@/lib/workouts/personal-records'

type DashboardPageProps = {
  searchParams: Promise<DashboardFilterQuery>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient()
  const sessionsQuery = supabase
    .from('workout_sessions')
    .select(
      'id,date,created_at,workout_sets(id,weight,reps,created_at,exercises(id,name,muscle_group))'
    )
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })
  const exercisesQuery = supabase.from('exercises').select('id,name').order('name')
  const [sessionsResult, exercisesResult, query] = await Promise.all([
    sessionsQuery,
    exercisesQuery,
    searchParams,
  ])

  if (sessionsResult.error || exercisesResult.error) {
    throw new Error('ダッシュボード指標を取得できませんでした')
  }

  const exercises = exercisesResult.data ?? []
  const filters = parseDashboardFilters(
    query,
    exercises.map((exercise) => exercise.id)
  )
  const referenceDate = new Date()
  const filtered = filterDashboardSessions(
    (sessionsResult.data ?? []) as DashboardFilterWorkoutSession[],
    filters,
    referenceDate
  )
  const metrics = buildDashboardMetrics(filtered.sessions, {
    referenceDate,
    startDate: filtered.startDate,
  })
  const personalRecords = buildPersonalRecords(filtered.sessions)

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">LiftDash</p>
          <h1 className="text-3xl font-semibold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground">トレーニング記録をここから確認できます。</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="text-sm font-medium text-primary hover:underline" href="/presets">
            プリセット
          </Link>
          <Link className="text-sm font-medium text-primary hover:underline" href="/log">
            記録一覧
          </Link>
          <Link className="text-sm font-medium text-primary hover:underline" href="/log/new">
            記録を追加
          </Link>
          <Link className="text-sm font-medium text-primary hover:underline" href="/exercises">
            種目マスタ
          </Link>
          <LogoutButton />
        </div>
      </header>

      <DashboardFilters exercises={exercises} filters={filters} />
      <PersonalRecordCards records={personalRecords} />
      <DashboardCharts metrics={metrics} />
    </main>
  )
}
