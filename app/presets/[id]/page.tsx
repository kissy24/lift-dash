import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PresetForm } from '@/components/forms/PresetForm'
import { createClient } from '@/lib/supabase/server'
import { presetIdSchema } from '@/lib/validations/preset'

type EditPresetPageProps = { params: Promise<{ id: string }> }

export default async function EditPresetPage({ params }: EditPresetPageProps) {
  const routeParams = await params
  const parsedId = presetIdSchema.safeParse(routeParams.id)
  if (!parsedId.success) notFound()

  const supabase = await createClient()
  const [presetResult, exercisesResult] = await Promise.all([
    supabase
      .from('presets')
      .select(
        'id,name,preset_items(exercise_id,order_index,default_weight,default_reps,default_sets)'
      )
      .eq('id', parsedId.data)
      .single(),
    supabase.from('exercises').select('*').order('name', { ascending: true }),
  ])

  if (presetResult.error || !presetResult.data) notFound()
  if (exercisesResult.error) throw new Error('種目一覧を取得できませんでした')

  const items = [...presetResult.data.preset_items]
    .sort((a, b) => a.order_index - b.order_index)
    .map((item) => ({
      exerciseId: item.exercise_id,
      defaultWeight: item.default_weight,
      defaultReps: item.default_reps,
      defaultSets: item.default_sets,
    }))

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">LiftDash</p>
          <h1 className="text-3xl font-semibold tracking-tight">プリセットを編集</h1>
          <p className="text-sm text-muted-foreground">種目、デフォルト値、実施順を変更します。</p>
        </div>
        <Link className="text-sm font-medium text-primary hover:underline" href="/presets">
          一覧へ戻る
        </Link>
      </header>

      <PresetForm
        exercises={exercisesResult.data}
        initialPreset={{
          id: presetResult.data.id,
          name: presetResult.data.name,
          items,
        }}
      />
    </main>
  )
}
