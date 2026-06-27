import Link from 'next/link'

import { ExerciseList } from '@/components/exercises/ExerciseList'
import { ExerciseForm } from '@/components/forms/ExerciseForm'
import { createClient } from '@/lib/supabase/server'

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error('種目一覧を取得できませんでした')

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">LiftDash</p>
          <h1 className="text-3xl font-semibold tracking-tight">種目マスタ</h1>
          <p className="text-sm text-muted-foreground">トレーニングで使用する種目を管理します。</p>
        </div>
        <Link className="text-sm font-medium text-primary hover:underline" href="/dashboard">
          ダッシュボードへ
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <section className="h-fit rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">種目を追加</h2>
          <ExerciseForm />
        </section>
        <section>
          <h2 className="mb-4 text-lg font-semibold">登録済み種目</h2>
          <ExerciseList exercises={exercises} />
        </section>
      </div>
    </main>
  )
}
