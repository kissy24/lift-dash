'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { WorkoutForm } from '@/components/forms/WorkoutForm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  deleteWorkoutSessionAction,
  deleteWorkoutSetAction,
  updateWorkoutSetAction,
} from '@/lib/actions/workout'
import type { Exercise } from '@/lib/supabase/database.types'
import type { WorkoutSessionView, WorkoutSetView } from '@/lib/workouts/types'

type WorkoutSessionCardProps = {
  session: WorkoutSessionView
  exercises: Exercise[]
  sessionNumber: number
}

type WorkoutSetEditorProps = {
  workoutSet: WorkoutSetView
  sessionId: string
  date: string
}

function WorkoutSetEditor({ workoutSet, sessionId, date }: WorkoutSetEditorProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function baseFormData(form?: HTMLFormElement) {
    const formData = form ? new FormData(form) : new FormData()
    formData.set('id', workoutSet.id)
    formData.set('sessionId', sessionId)
    formData.set('date', date)
    return formData
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = baseFormData(event.currentTarget)
    startTransition(async () => {
      const result = await updateWorkoutSetAction(formData)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.refresh()
    })
  }

  function handleDelete() {
    if (!window.confirm(`セット${workoutSet.setNumber}を削除しますか？`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteWorkoutSetAction(baseFormData())
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <form className="space-y-3 rounded-lg bg-muted/50 p-3" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${workoutSet.id}-weight`}>
            セット{workoutSet.setNumber}の重量（kg）
          </Label>
          <Input
            id={`${workoutSet.id}-weight`}
            name="weight"
            type="number"
            min="0"
            max="9999.99"
            step="0.01"
            defaultValue={workoutSet.weight}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${workoutSet.id}-reps`}>セット{workoutSet.setNumber}のレップ数</Label>
          <Input
            id={`${workoutSet.id}-reps`}
            name="reps"
            type="number"
            min="1"
            max="9999"
            step="1"
            defaultValue={workoutSet.reps}
            required
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          セット{workoutSet.setNumber}を保存
        </Button>
        <Button
          className="border bg-background text-destructive hover:bg-muted"
          type="button"
          disabled={isPending}
          onClick={handleDelete}
        >
          セット{workoutSet.setNumber}を削除
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}

export function WorkoutSessionCard({ session, exercises, sessionNumber }: WorkoutSessionCardProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDeleteSession() {
    if (!window.confirm(`セッション ${sessionNumber} を削除しますか？`)) return
    const formData = new FormData()
    formData.set('id', session.id)
    formData.set('date', session.date)
    setError(null)
    startTransition(async () => {
      const result = await deleteWorkoutSessionAction(formData)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.push('/log')
    })
  }

  if (isEditing) {
    return (
      <section className="space-y-5 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">セッション {sessionNumber} を編集</h2>
          <Button
            className="border bg-background text-foreground hover:bg-muted"
            onClick={() => setIsEditing(false)}
          >
            キャンセル
          </Button>
        </div>
        <WorkoutForm
          exercises={exercises}
          initialSession={{
            id: session.id,
            date: session.date,
            notes: session.notes ?? '',
            exercises: session.exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              sets: exercise.sets.map((workoutSet) => ({
                weight: workoutSet.weight,
                reps: workoutSet.reps,
              })),
            })),
          }}
        />
      </section>
    )
  }

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-semibold">セッション {sessionNumber}</h2>
          {session.notes ? (
            <p className="mt-1 text-sm text-muted-foreground">{session.notes}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            className="border bg-background text-foreground hover:bg-muted"
            onClick={() => setIsEditing(true)}
          >
            セッションを編集
          </Button>
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={handleDeleteSession}
          >
            セッションを削除
          </Button>
        </div>
      </div>

      {session.exercises.map((exercise) => (
        <section className="space-y-3" key={exercise.exerciseId}>
          <h3 className="font-semibold">{exercise.exerciseName}</h3>
          {exercise.sets.map((workoutSet) => (
            <WorkoutSetEditor
              key={workoutSet.id}
              workoutSet={workoutSet}
              sessionId={session.id}
              date={session.date}
            />
          ))}
        </section>
      ))}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
