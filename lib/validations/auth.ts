import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export const totpCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, '6桁の認証コードを入力してください'),
})

export const totpEnrollmentSchema = totpCodeSchema.extend({
  factorId: z.string().min(1, 'MFA登録情報が見つかりません'),
})
