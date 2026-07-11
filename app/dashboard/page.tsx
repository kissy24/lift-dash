import Link from 'next/link'

import { DashboardCharts } from '@/components/charts/DashboardCharts'
import { LogoutButton } from '@/components/forms/LogoutButton'
import { PersonalRecordCards } from '@/components/workouts/PersonalRecordCards'
import { createClient } from '@/lib/supabase/server'
import {
  buildDashboardMetrics,
  type DashboardWorkoutSession,
} from '@/lib/workouts/dashboard-metrics'
import {
  buildPersonalRecords,
  type PersonalRecordWorkoutSession,
} from '@/lib/workouts/personal-records'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select(
      'id,date,created_at,workout_sets(id,weight,reps,created_at,exercises(id,name,muscle_group))'
    )
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error('ダッシュボード指標を取得できませんでした')

  const metrics = buildDashboardMetrics((sessions ?? []) as DashboardWorkoutSession[])
  const personalRecords = buildPersonalRecords((sessions ?? []) as PersonalRecordWorkoutSession[])

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

      <PersonalRecordCards records={personalRecords} />
      <DashboardCharts metrics={metrics} />
    </main>
  )
}
