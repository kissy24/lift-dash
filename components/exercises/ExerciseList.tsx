'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { ExerciseForm } from '@/components/forms/ExerciseForm'
import { Button } from '@/components/ui/Button'
import { deleteExerciseAction } from '@/lib/actions/exercise'
import { MUSCLE_GROUP_LABELS } from '@/lib/exercises/muscle-groups'
import type { Exercise } from '@/lib/supabase/database.types'

type ExerciseListProps = {
  exercises: Exercise[]
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function deleteExercise(exercise: Exercise) {
    if (!window.confirm(`「${exercise.name}」を削除しますか？`)) return

    const formData = new FormData()
    formData.set('id', exercise.id)
    setError(null)
    startTransition(async () => {
      const result = await deleteExerciseAction(formData)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.refresh()
    })
  }

  if (exercises.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        登録済みの種目はありません
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="space-y-3">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-medium">{exercise.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
                </p>
              </div>
              <Button
                className="h-9 bg-destructive px-3 text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteExercise(exercise)}
                disabled={isPending}
                aria-label={`${exercise.name}を削除`}
              >
                削除
              </Button>
            </div>
            <details className="mt-4 border-t pt-4">
              <summary className="cursor-pointer text-sm font-medium text-primary">編集</summary>
              <div className="mt-4">
                <ExerciseForm exercise={exercise} />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}
