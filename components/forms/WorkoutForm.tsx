'use client'

import { format } from 'date-fns'
import { useState, useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { PresetSelector } from '@/components/forms/PresetSelector'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { createWorkoutAction, updateWorkoutAction } from '@/lib/actions/workout'
import type { Exercise } from '@/lib/supabase/database.types'
import { updateWorkoutSessionSchema, workoutSessionSchema } from '@/lib/validations/workout'
import { presetToWorkoutExercises, type WorkoutPreset } from '@/lib/workouts/preset-defaults'

type WorkoutFormValues = {
  date: string
  notes: string
  exercises: Array<{
    exerciseId: string
    sets: Array<{ weight: number; reps: number }>
  }>
}

type WorkoutFormProps = {
  exercises: Exercise[]
  initialSession?: WorkoutFormInitialSession
  presets?: WorkoutPreset[]
}

export type WorkoutFormInitialSession = WorkoutFormValues & { id: string }

const EMPTY_SET = { weight: 0, reps: 1 }

export function WorkoutForm({ exercises, initialSession, presets }: WorkoutFormProps) {
  const router = useRouter()
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [isPending, startTransition] = useTransition()
  const { control, formState, getValues, handleSubmit, register, setValue, watch } =
    useForm<WorkoutFormValues>({
      defaultValues: {
        date: initialSession?.date ?? format(new Date(), 'yyyy-MM-dd'),
        notes: initialSession?.notes ?? '',
        exercises: initialSession?.exercises ?? [
          { exerciseId: exercises[0]?.id ?? '', sets: [EMPTY_SET] },
        ],
      },
    })
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'exercises' })
  const formExercises = watch('exercises')
  const selectedIds = formExercises.map((exercise) => exercise.exerciseId)
  const isDirty = formState.isDirty

  function selectPreset(presetId: string) {
    const preset = presets?.find((candidate) => candidate.id === presetId)
    if (!preset) return
    if (isDirty && !window.confirm('未保存の入力をプリセット内容で置き換えますか？')) {
      return
    }
    replace(presetToWorkoutExercises(preset))
    setSelectedPresetId(presetId)
    setActionError(null)
  }

  function addExercise() {
    const nextExercise = exercises.find((exercise) => !selectedIds.includes(exercise.id))
    if (!nextExercise) return
    append({ exerciseId: nextExercise.id, sets: [EMPTY_SET] })
  }

  function addSet(exerciseIndex: number) {
    const sets = getValues(`exercises.${exerciseIndex}.sets`)
    if (sets.length >= 20) return
    setValue(`exercises.${exerciseIndex}.sets`, [...sets, EMPTY_SET], { shouldDirty: true })
  }

  function removeSet(exerciseIndex: number) {
    const sets = getValues(`exercises.${exerciseIndex}.sets`)
    if (sets.length <= 1) return
    setValue(`exercises.${exerciseIndex}.sets`, sets.slice(0, -1), { shouldDirty: true })
  }

  function submitWorkout(values: WorkoutFormValues) {
    setActionError(null)
    const payload = initialSession ? { ...values, id: initialSession.id } : values
    const parsed = initialSession
      ? updateWorkoutSessionSchema.safeParse(payload)
      : workoutSessionSchema.safeParse(payload)
    if (!parsed.success) {
      setActionError(parsed.error.issues[0]?.message ?? '入力内容を確認してください')
      return
    }

    const formData = new FormData()
    formData.set('payload', JSON.stringify(parsed.data))
    startTransition(async () => {
      const result = initialSession
        ? await updateWorkoutAction(formData)
        : await createWorkoutAction(formData)
      if (!result.success) {
        setActionError(result.error.message)
        return
      }
      router.push(`/log/${result.data.date}`)
    })
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit(submitWorkout)} noValidate>
      {presets ? (
        <PresetSelector
          presets={presets}
          selectedPresetId={selectedPresetId}
          onSelect={selectPreset}
        />
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="workout-date">トレーニング日</Label>
          <Input id="workout-date" type="date" required {...register('date')} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="workout-notes">メモ</Label>
          <textarea
            id="workout-notes"
            className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-sm"
            maxLength={2000}
            {...register('notes')}
          />
        </div>
      </div>

      <div className="space-y-5">
        {fields.map((field, exerciseIndex) => {
          const currentExerciseId = formExercises[exerciseIndex]?.exerciseId ?? ''
          const sets = formExercises[exerciseIndex]?.sets ?? []
          return (
            <fieldset
              key={field.id}
              aria-label={`種目${exerciseIndex + 1}`}
              className="space-y-5 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
            >
              <legend className="px-1 text-base font-semibold">種目 {exerciseIndex + 1}</legend>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`exercise-${field.id}`}>種目</Label>
                  <Select
                    id={`exercise-${field.id}`}
                    required
                    {...register(`exercises.${exerciseIndex}.exerciseId`)}
                  >
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
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  type="button"
                  disabled={fields.length <= 1}
                  onClick={() => remove(exerciseIndex)}
                >
                  種目を削除
                </Button>
              </div>

              <div className="space-y-3">
                {sets.map((_set, setIndex) => (
                  <div
                    className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3"
                    key={`${field.id}-set-${setIndex}`}
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`${field.id}-weight-${setIndex}`}>
                        セット{setIndex + 1}の重量（kg）
                      </Label>
                      <Input
                        id={`${field.id}-weight-${setIndex}`}
                        type="number"
                        min="0"
                        max="9999.99"
                        step="0.01"
                        inputMode="decimal"
                        required
                        {...register(`exercises.${exerciseIndex}.sets.${setIndex}.weight`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${field.id}-reps-${setIndex}`}>
                        セット{setIndex + 1}のレップ数
                      </Label>
                      <Input
                        id={`${field.id}-reps-${setIndex}`}
                        type="number"
                        min="1"
                        max="9999"
                        step="1"
                        inputMode="numeric"
                        required
                        {...register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  disabled={sets.length >= 20}
                  onClick={() => addSet(exerciseIndex)}
                >
                  セットを追加
                </Button>
                <Button
                  className="border bg-background text-foreground hover:bg-muted"
                  type="button"
                  disabled={sets.length <= 1}
                  onClick={() => removeSet(exerciseIndex)}
                >
                  セットを削除
                </Button>
              </div>
            </fieldset>
          )
        })}
      </div>

      <Button
        className="w-full border bg-background text-foreground hover:bg-muted sm:w-auto"
        type="button"
        disabled={fields.length >= exercises.length || fields.length >= 20}
        onClick={addExercise}
      >
        種目を追加
      </Button>

      {actionError ? (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}

      <Button className="w-full sm:w-auto" type="submit" disabled={isPending}>
        {isPending ? '保存中…' : initialSession ? '変更を保存' : '記録を保存'}
      </Button>
    </form>
  )
}
