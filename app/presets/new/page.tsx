import Link from 'next/link'

import { PresetForm } from '@/components/forms/PresetForm'
import { createClient } from '@/lib/supabase/server'

export default async function NewPresetPage() {
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
          <h1 className="text-3xl font-semibold tracking-tight">プリセットを作成</h1>
          <p className="text-sm text-muted-foreground">種目とデフォルト値を実施順に登録します。</p>
        </div>
        <Link className="text-sm font-medium text-primary hover:underline" href="/presets">
          一覧へ戻る
        </Link>
      </header>

      {exercises.length > 0 ? (
        <PresetForm exercises={exercises} />
      ) : (
        <section className="rounded-xl border bg-card p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">種目が登録されていません</h2>
          <Link
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            href="/exercises"
          >
            種目を登録
          </Link>
        </section>
      )}
    </main>
  )
}
