'use server'

import { revalidatePath } from 'next/cache'
import type { ZodError } from 'zod'

import type { ActionFailure, ActionResult } from '@/lib/actions/action-result'
import { requireAal2 } from '@/lib/auth/require-aal2'
import { createClient } from '@/lib/supabase/server'
import {
  deletePresetSchema,
  presetSchema,
  updatePresetSchema,
  type PresetInput,
} from '@/lib/validations/preset'

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

function toRpcItems(preset: PresetInput) {
  return preset.items.map((item, index) => ({
    exercise_id: item.exerciseId,
    order_index: index,
    default_weight: item.defaultWeight,
    default_reps: item.defaultReps,
    default_sets: item.defaultSets,
  }))
}

export async function createPresetAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = presetSchema.safeParse(parsePayload(formData.get('payload')))
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase.rpc('create_preset', {
    p_name: parsed.data.name,
    p_items: toRpcItems(parsed.data),
  })
  if (error || !data) {
    return { success: false, error: { message: 'プリセットを登録できませんでした' } }
  }

  revalidatePath('/presets')
  return { success: true, data: { id: data } }
}

export async function updatePresetAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = updatePresetSchema.safeParse(parsePayload(formData.get('payload')))
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase.rpc('update_preset', {
    p_preset_id: parsed.data.id,
    p_name: parsed.data.name,
    p_items: toRpcItems(parsed.data),
  })
  if (error || !data) {
    return { success: false, error: { message: 'プリセットを更新できませんでした' } }
  }

  revalidatePath('/presets')
  revalidatePath(`/presets/${parsed.data.id}`)
  return { success: true, data: { id: parsed.data.id } }
}

export async function deletePresetAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const authFailure = await requireAal2(supabase)
  if (authFailure) return authFailure

  const parsed = deletePresetSchema.safeParse({ id: formData.get('id') })
  if (!parsed.success) return validationFailure(parsed.error)

  const { data, error } = await supabase
    .from('presets')
    .delete()
    .eq('id', parsed.data.id)
    .select('id')
    .single()
  if (error || !data) {
    return { success: false, error: { message: 'プリセットを削除できませんでした' } }
  }

  revalidatePath('/presets')
  return { success: true, data: undefined }
}
