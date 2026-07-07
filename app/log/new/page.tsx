import Link from 'next/link'

import { WorkoutForm } from '@/components/forms/WorkoutForm'
import { getPreviousValuesByExercise } from '@/lib/queries/workout'
import { createClient } from '@/lib/supabase/server'

export default async function NewWorkoutPage() {
  const supabase = await createClient()
  const [exercisesResult, presetsResult] = await Promise.all([
    supabase.from('exercises').select('*').order('name', { ascending: true }),
    supabase
      .from('presets')
      .select(
        'id,name,preset_items(exercise_id,order_index,default_weight,default_reps,default_sets)'
      )
      .order('name', { ascending: true }),
  ])

  if (exercisesResult.error) throw new Error('種目一覧を取得できませんでした')
  if (presetsResult.error) throw new Error('プリセット一覧を取得できませんでした')

  const previousValues = await getPreviousValuesByExercise(
    supabase,
    exercisesResult.data.map((exercise) => exercise.id)
  )

  const presets = presetsResult.data.map((preset) => ({
    id: preset.id,
    name: preset.name,
    items: preset.preset_items.map((item) => ({
      exerciseId: item.exercise_id,
      orderIndex: item.order_index,
      defaultWeight: item.default_weight,
      defaultReps: item.default_reps,
      defaultSets: item.default_sets,
    })),
  }))

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

      {exercisesResult.data.length > 0 ? (
        <WorkoutForm
          exercises={exercisesResult.data}
          presets={presets}
          previousValues={previousValues}
        />
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
