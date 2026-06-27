import { z } from 'zod'

import { MUSCLE_GROUPS } from '@/lib/exercises/muscle-groups'

export const exerciseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '種目名を入力してください')
    .max(100, '種目名は100文字以内で入力してください'),
  muscleGroup: z.enum(MUSCLE_GROUPS, '筋肉部位を選択してください'),
})

export const exerciseIdSchema = z.uuid('種目IDが正しくありません')

export const updateExerciseSchema = exerciseSchema.extend({ id: exerciseIdSchema })
export const deleteExerciseSchema = z.object({ id: exerciseIdSchema })
