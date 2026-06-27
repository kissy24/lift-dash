'use server'

import { revalidatePath } from 'next/cache'
import type { ZodError } from 'zod'

import type { ActionFailure, ActionResult } from '@/lib/actions/action-result'
import { requireAal2 } from '@/lib/auth/require-aal2'
import { createClient } from '@/lib/supabase/server'
import {
  deleteExerciseSchema,
  exerciseSchema,
  updateExerciseSchema,
} from '@/lib/validations/exercise'

function validationFailure(error: ZodError): ActionFailure {
  const fields: Record<string, string[]> = {}
  error.issues.forEach((issue) => {
    const field = issue.path[0]?.toString() ?? 'form'
    fields[field] = [...(fields[field] ?? []), issue.message]
  })
  return { success: false, error: { message: '入力内容を確認してください', fields } }
}

export async function createExerciseAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = exerciseSchema.safeParse({
    name: formData.get('name'),
    muscleGroup: formData.get('muscleGroup'),
  })
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase
    .from('exercises')
    .insert({ name: parsed.data.name, muscle_group: parsed.data.muscleGroup })
    .select('id')
    .single()
  if (error || !data) {
    return { success: false, error: { message: '種目を登録できませんでした' } }
  }

  revalidatePath('/exercises')
  return { success: true, data: { id: data.id } }
}

export async function updateExerciseAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = updateExerciseSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    muscleGroup: formData.get('muscleGroup'),
  })
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase
    .from('exercises')
    .update({ name: parsed.data.name, muscle_group: parsed.data.muscleGroup })
    .eq('id', parsed.data.id)
    .select('id')
    .single()
  if (error || !data) {
    return { success: false, error: { message: '種目を更新できませんでした' } }
  }

  revalidatePath('/exercises')
  return { success: true, data: undefined }
}

export async function deleteExerciseAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = deleteExerciseSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', parsed.data.id)
    .select('id')
    .single()
  if (error || !data) {
    return { success: false, error: { message: '種目を削除できませんでした' } }
  }

  revalidatePath('/exercises')
  return { success: true, data: undefined }
}
