'use client'

import { useId, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { createExerciseAction, updateExerciseAction } from '@/lib/actions/exercise'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUPS } from '@/lib/exercises/muscle-groups'
import type { Exercise } from '@/lib/supabase/database.types'

type ExerciseFormProps = {
  exercise?: Exercise
}

export function ExerciseForm({ exercise }: ExerciseFormProps) {
  const router = useRouter()
  const fieldId = useId()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(exercise)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    if (exercise) formData.set('id', exercise.id)
    setError(null)

    startTransition(async () => {
      const result = exercise
        ? await updateExerciseAction(formData)
        : await createExerciseAction(formData)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      if (!exercise) form.reset()
      router.refresh()
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor={`${fieldId}-name`}>種目名</Label>
        <Input
          id={`${fieldId}-name`}
          name="name"
          defaultValue={exercise?.name}
          maxLength={100}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${fieldId}-muscle-group`}>筋肉部位</Label>
        <Select
          id={`${fieldId}-muscle-group`}
          name="muscleGroup"
          defaultValue={exercise?.muscle_group ?? 'other'}
          required
        >
          {MUSCLE_GROUPS.map((muscleGroup) => (
            <option key={muscleGroup} value={muscleGroup}>
              {MUSCLE_GROUP_LABELS[muscleGroup]}
            </option>
          ))}
        </Select>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? '保存中…' : isEditing ? '変更を保存' : '種目を登録'}
      </Button>
    </form>
  )
}
