import { z } from 'zod'

function emptyToNull(value: unknown): unknown {
  return value === '' || value === undefined ? null : value
}

const nullableWeightSchema = z.preprocess(
  emptyToNull,
  z.coerce
    .number('デフォルト重量を数値で入力してください')
    .min(0, 'デフォルト重量は0以上で入力してください')
    .max(9999.99, 'デフォルト重量は9999.99kg以下で入力してください')
    .multipleOf(0.01, 'デフォルト重量は小数第2位までで入力してください')
    .nullable()
)

const nullableRepsSchema = z.preprocess(
  emptyToNull,
  z.coerce
    .number('デフォルトレップ数を数値で入力してください')
    .int('デフォルトレップ数は整数で入力してください')
    .min(1, 'デフォルトレップ数は1以上で入力してください')
    .max(9999, 'デフォルトレップ数は9999以下で入力してください')
    .nullable()
)

const presetItemSchema = z.object({
  exerciseId: z.uuid('種目を選択してください'),
  defaultWeight: nullableWeightSchema,
  defaultReps: nullableRepsSchema,
  defaultSets: z.coerce
    .number('デフォルトセット数を入力してください')
    .int('デフォルトセット数は整数で入力してください')
    .min(1, 'デフォルトセット数は1以上で入力してください')
    .max(20, 'デフォルトセット数は20以下で入力してください'),
})

export const presetSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'プリセット名を入力してください')
      .max(100, 'プリセット名は100文字以内で入力してください'),
    items: z
      .array(presetItemSchema)
      .min(1, '種目を1つ以上追加してください')
      .max(20, '種目は20個以内で追加してください'),
  })
  .superRefine((value, context) => {
    const exerciseIds = new Set<string>()
    value.items.forEach((item, index) => {
      if (exerciseIds.has(item.exerciseId)) {
        context.addIssue({
          code: 'custom',
          message: '同じ種目は複数追加できません',
          path: ['items', index, 'exerciseId'],
        })
      }
      exerciseIds.add(item.exerciseId)
    })
  })

export const presetIdSchema = z.uuid('プリセットIDが正しくありません')

export const updatePresetSchema = presetSchema.safeExtend({ id: presetIdSchema })

export const deletePresetSchema = z.object({
  id: presetIdSchema,
})

export type PresetInput = z.output<typeof presetSchema>
