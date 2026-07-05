import { z } from 'zod'

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const workoutSetSchema = z.object({
  weight: z.coerce
    .number('重量を入力してください')
    .min(0, '重量は0以上で入力してください')
    .max(9999.99, '重量は9999.99kg以下で入力してください')
    .multipleOf(0.01, '重量は小数第2位までで入力してください'),
  reps: z.coerce
    .number('レップ数を入力してください')
    .int('レップ数は整数で入力してください')
    .min(1, 'レップ数は1以上で入力してください')
    .max(9999, 'レップ数は9999以下で入力してください'),
})

const workoutExerciseSchema = z.object({
  exerciseId: z.uuid('種目を選択してください'),
  sets: z
    .array(workoutSetSchema)
    .min(1, 'セットを1つ以上追加してください')
    .max(20, 'セットは20個以内で入力してください'),
})

export const workoutSessionSchema = z
  .object({
    date: z.string().refine(isCalendarDate, '日付が正しくありません'),
    notes: z.string().trim().max(2000, 'メモは2000文字以内で入力してください'),
    exercises: z
      .array(workoutExerciseSchema)
      .min(1, '種目を1つ以上追加してください')
      .max(20, '種目は20個以内で追加してください'),
  })
  .superRefine((value, context) => {
    const exerciseIds = new Set<string>()
    value.exercises.forEach((exercise, index) => {
      if (exerciseIds.has(exercise.exerciseId)) {
        context.addIssue({
          code: 'custom',
          message: '同じ種目は複数追加できません',
          path: ['exercises', index, 'exerciseId'],
        })
      }
      exerciseIds.add(exercise.exerciseId)
    })
  })

export type WorkoutSessionInput = z.input<typeof workoutSessionSchema>
export type WorkoutSession = z.output<typeof workoutSessionSchema>
