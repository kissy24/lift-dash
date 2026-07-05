'use client'

import { useState, useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { createPresetAction, updatePresetAction } from '@/lib/actions/preset'
import type { Exercise } from '@/lib/supabase/database.types'
import { presetSchema, updatePresetSchema } from '@/lib/validations/preset'

type PresetFormValues = {
  name: string
  items: Array<{
    exerciseId: string
    defaultWeight: number | null
    defaultReps: number | null
    defaultSets: number
  }>
}

export type PresetFormInitialValue = PresetFormValues & { id: string }

type PresetFormProps = {
  exercises: Exercise[]
  initialPreset?: PresetFormInitialValue
}

function optionalNumber(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

export function PresetForm({ exercises, initialPreset }: PresetFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { control, handleSubmit, register, watch } = useForm<PresetFormValues>({
    defaultValues: initialPreset ?? {
      name: '',
      items: [
        {
          exerciseId: exercises[0]?.id ?? '',
          defaultWeight: null,
          defaultReps: null,
          defaultSets: 3,
        },
      ],
    },
  })
  const { fields, append, remove, swap } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const selectedIds = items.map((item) => item.exerciseId)

  function addItem() {
    const nextExercise = exercises.find((exercise) => !selectedIds.includes(exercise.id))
    if (!nextExercise) return
    append({
      exerciseId: nextExercise.id,
      defaultWeight: null,
      defaultReps: null,
      defaultSets: 3,
    })
  }

  function submitPreset(values: PresetFormValues) {
    setError(null)
    const payload = initialPreset ? { ...values, id: initialPreset.id } : values
    const parsed = initialPreset
      ? updatePresetSchema.safeParse(payload)
      : presetSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '入力内容を確認してください')
      return
    }

    const formData = new FormData()
    formData.set('payload', JSON.stringify(parsed.data))
    startTransition(async () => {
      const result = initialPreset
        ? await updatePresetAction(formData)
        : await createPresetAction(formData)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.push(`/presets/${result.data.id}`)
    })
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit(submitPreset)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="preset-name">プリセット名</Label>
        <Input id="preset-name" maxLength={100} required {...register('name')} />
      </div>

      <div className="space-y-5">
        {fields.map((field, index) => {
          const currentExerciseId = items[index]?.exerciseId ?? ''
          return (
            <fieldset key={field.id} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
              <legend className="px-1 font-semibold">種目 {index + 1}</legend>
              <div className="space-y-2">
                <Label htmlFor={`${field.id}-exercise`}>種目</Label>
                <Select id={`${field.id}-exercise`} {...register(`items.${index}.exerciseId`)}>
                  {exercises.map((exercise) => (
                    <option
                      key={exercise.id}
                      value={exercise.id}
                      disabled={
                        exercise.id !== currentExerciseId && selectedIds.includes(exercise.id)
                      }
                    >
                      {exercise.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`${field.id}-weight`}>デフォルト重量（kg）</Label>
                  <Input
                    id={`${field.id}-weight`}
                    type="number"
                    min="0"
                    max="9999.99"
                    step="0.01"
                    {...register(`items.${index}.defaultWeight`, { setValueAs: optionalNumber })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${field.id}-reps`}>デフォルトレップ数</Label>
                  <Input
                    id={`${field.id}-reps`}
                    type="number"
                    min="1"
                    max="9999"
                    step="1"
                    {...register(`items.${index}.defaultReps`, { setValueAs: optionalNumber })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${field.id}-sets`}>デフォルトセット数</Label>
                  <Input
                    id={`${field.id}-sets`}
                    type="number"
                    min="1"
                    max="20"
                    step="1"
                    required
                    {...register(`items.${index}.defaultSets`, { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="border bg-background text-foreground hover:bg-muted"
                  type="button"
                  disabled={index === 0}
                  onClick={() => swap(index, index - 1)}
                >
                  上へ移動
                </Button>
                <Button
                  className="border bg-background text-foreground hover:bg-muted"
                  type="button"
                  disabled={index === fields.length - 1}
                  onClick={() => swap(index, index + 1)}
                >
                  下へ移動
                </Button>
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  type="button"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                >
                  種目を削除
                </Button>
              </div>
            </fieldset>
          )
        })}
      </div>

      <Button
        className="border bg-background text-foreground hover:bg-muted"
        type="button"
        disabled={fields.length >= exercises.length || fields.length >= 20}
        onClick={addItem}
      >
        種目を追加
      </Button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? '保存中…' : initialPreset ? '変更を保存' : 'プリセットを登録'}
      </Button>
    </form>
  )
}
