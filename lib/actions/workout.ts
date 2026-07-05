'use server'

import { revalidatePath } from 'next/cache'
import type { ZodError } from 'zod'

import type { ActionFailure, ActionResult } from '@/lib/actions/action-result'
import { requireAal2 } from '@/lib/auth/require-aal2'
import { createClient } from '@/lib/supabase/server'
import {
  deleteWorkoutSessionSchema,
  mutateWorkoutSetSchema,
  updateWorkoutSessionSchema,
  workoutSessionSchema,
  workoutSetIdentitySchema,
  type WorkoutSession,
} from '@/lib/validations/workout'

function validationFailure(error: ZodError): ActionFailure {
  const fields: Record<string, string[]> = {}
  error.issues.forEach((issue) => {
    const field = issue.path[0]?.toString() ?? 'form'
    fields[field] = [...(fields[field] ?? []), issue.message]
  })
  return { success: false, error: { message: '入力内容を確認してください', fields } }
}

function parsePayload(value: FormDataEntryValue | null): unknown {
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function toRpcSets(workout: WorkoutSession) {
  return workout.exercises.flatMap((exercise) =>
    exercise.sets.map((set, index) => ({
      exercise_id: exercise.exerciseId,
      set_number: index + 1,
      weight: set.weight,
      reps: set.reps,
    }))
  )
}

function revalidateWorkoutPaths(date: string) {
  revalidatePath('/log')
  revalidatePath(`/log/${date}`)
}

export async function createWorkoutAction(
  formData: FormData
): Promise<ActionResult<{ id: string; date: string }>> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = workoutSessionSchema.safeParse(parsePayload(formData.get('payload')))
  if (!parsed.success) return validationFailure(parsed.error)

  const sets = toRpcSets(parsed.data)
  const { data, error } = await supabase.rpc('create_workout_session', {
    p_date: parsed.data.date,
    p_notes: parsed.data.notes,
    p_sets: sets,
  })
  if (error || !data) {
    return {
      success: false,
      error: { message: 'トレーニング記録を保存できませんでした' },
    }
  }

  revalidatePath('/log')
  return { success: true, data: { id: data, date: parsed.data.date } }
}

export async function updateWorkoutAction(
  formData: FormData
): Promise<ActionResult<{ id: string; date: string }>> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = updateWorkoutSessionSchema.safeParse(parsePayload(formData.get('payload')))
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase.rpc('update_workout_session', {
    p_session_id: parsed.data.id,
    p_date: parsed.data.date,
    p_notes: parsed.data.notes,
    p_sets: toRpcSets(parsed.data),
  })
  if (error || !data) {
    return { success: false, error: { message: 'トレーニング記録を更新できませんでした' } }
  }

  revalidateWorkoutPaths(parsed.data.date)
  return { success: true, data: { id: parsed.data.id, date: parsed.data.date } }
}

export async function deleteWorkoutSessionAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = deleteWorkoutSessionSchema.safeParse({
    id: formData.get('id'),
    date: formData.get('date'),
  })
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', parsed.data.id)
    .select('id')
    .single()
  if (error || !data) {
    return { success: false, error: { message: 'トレーニング記録を削除できませんでした' } }
  }

  revalidateWorkoutPaths(parsed.data.date)
  return { success: true, data: undefined }
}

export async function updateWorkoutSetAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = mutateWorkoutSetSchema.safeParse({
    id: formData.get('id'),
    sessionId: formData.get('sessionId'),
    date: formData.get('date'),
    weight: formData.get('weight'),
    reps: formData.get('reps'),
  })
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase
    .from('workout_sets')
    .update({ weight: parsed.data.weight, reps: parsed.data.reps })
    .eq('id', parsed.data.id)
    .eq('session_id', parsed.data.sessionId)
    .select('id')
    .single()
  if (error || !data) {
    return { success: false, error: { message: 'セットを更新できませんでした' } }
  }

  revalidateWorkoutPaths(parsed.data.date)
  return { success: true, data: undefined }
}

export async function deleteWorkoutSetAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = workoutSetIdentitySchema.safeParse({
    id: formData.get('id'),
    sessionId: formData.get('sessionId'),
    date: formData.get('date'),
  })
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase.rpc('delete_workout_set', {
    p_set_id: parsed.data.id,
    p_session_id: parsed.data.sessionId,
  })
  if (error?.code === 'P0001') {
    return {
      success: false,
      error: { message: '最後のセットは削除できません。セッションを削除してください' },
    }
  }
  if (error || !data) {
    return { success: false, error: { message: 'セットを削除できませんでした' } }
  }

  revalidateWorkoutPaths(parsed.data.date)
  return { success: true, data: undefined }
}
