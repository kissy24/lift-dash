import Link from 'next/link'

import { PresetList } from '@/components/presets/PresetList'
import { createClient } from '@/lib/supabase/server'

export default async function PresetsPage() {
  const supabase = await createClient()
  const { data: presets, error } = await supabase
    .from('presets')
    .select('id,name,preset_items(id)')
    .order('updated_at', { ascending: false })

  if (error) throw new Error('プリセット一覧を取得できませんでした')

  const summaries = presets.map((preset) => ({
    id: preset.id,
    name: preset.name,
    itemCount: preset.preset_items.length,
  }))

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">LiftDash</p>
          <h1 className="text-3xl font-semibold tracking-tight">プリセット</h1>
          <p className="text-sm text-muted-foreground">
            よく使う種目とデフォルト値をまとめて管理します。
          </p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          href="/presets/new"
        >
          プリセットを作成
        </Link>
      </header>

      {summaries.length > 0 ? (
        <PresetList presets={summaries} />
      ) : (
        <section className="rounded-xl border bg-card p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">プリセットがありません</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            最初のプリセットを作成して入力準備を短縮しましょう。
          </p>
        </section>
      )}
    </main>
  )
}
