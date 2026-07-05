import Link from 'next/link'

import { WorkoutForm } from '@/components/forms/WorkoutForm'
import { createClient } from '@/lib/supabase/server'

export default async function NewWorkoutPage() {
  const supabase = await createClient()
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error('種目一覧を取得できませんでした')

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">LiftDash</p>
          <h1 className="text-3xl font-semibold tracking-tight">トレーニング記録</h1>
          <p className="text-sm text-muted-foreground">
            実施した種目、重量、レップ数をセットごとに記録します。
          </p>
        </div>
        <Link className="text-sm font-medium text-primary hover:underline" href="/dashboard">
          ダッシュボードへ
        </Link>
      </header>

      {exercises.length > 0 ? (
        <WorkoutForm exercises={exercises} />
      ) : (
        <section className="rounded-xl border bg-card p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">種目が登録されていません</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            トレーニングを記録する前に種目マスタを作成してください。
          </p>
          <Link
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            href="/exercises"
          >
            種目を登録
          </Link>
        </section>
      )}
    </main>
  )
}
