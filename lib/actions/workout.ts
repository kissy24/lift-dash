'use server'

import { revalidatePath } from 'next/cache'
import type { ZodError } from 'zod'

import type { ActionFailure, ActionResult } from '@/lib/actions/action-result'
import { requireAal2 } from '@/lib/auth/require-aal2'
import { createClient } from '@/lib/supabase/server'
import { workoutSessionSchema } from '@/lib/validations/workout'

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

export async function createWorkoutAction(
  formData: FormData
): Promise<ActionResult<{ id: string; date: string }>> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = workoutSessionSchema.safeParse(parsePayload(formData.get('payload')))
  if (!parsed.success) return validationFailure(parsed.error)

  const sets = parsed.data.exercises.flatMap((exercise) =>
    exercise.sets.map((set, index) => ({
      exercise_id: exercise.exerciseId,
      set_number: index + 1,
      weight: set.weight,
      reps: set.reps,
    }))
  )
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
