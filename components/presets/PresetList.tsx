'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { deletePresetAction } from '@/lib/actions/preset'

type PresetSummary = { id: string; name: string; itemCount: number }

export function PresetList({ presets }: { presets: PresetSummary[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete(preset: PresetSummary) {
    if (!window.confirm(`「${preset.name}」を削除しますか？`)) return
    const formData = new FormData()
    formData.set('id', preset.id)
    setError(null)
    startTransition(async () => {
      const result = await deletePresetAction(formData)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="grid gap-4 sm:grid-cols-2">
        {presets.map((preset) => (
          <li className="rounded-xl border bg-card p-5 shadow-sm" key={preset.id}>
            <Link
              className="text-lg font-semibold text-primary hover:underline"
              href={`/presets/${preset.id}`}
            >
              {preset.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{preset.itemCount}種目</p>
            <Button
              className="mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={() => handleDelete(preset)}
            >
              {preset.name}を削除
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
