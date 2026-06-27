'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ZodError } from 'zod'

import type { ActionResult } from '@/lib/actions/action-result'
import { getAuthDestination, type AuthDestination } from '@/lib/auth/route-guard'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, totpCodeSchema, totpEnrollmentSchema } from '@/lib/validations/auth'

type RedirectData = { redirectTo: AuthDestination }
type EnrollmentData = { factorId: string; qrCode: string; secret: string }
type ActionFailure = {
  success: false
  error: { message: string; fields?: Record<string, string[]> }
}

function validationFailure(error: ZodError): ActionFailure {
  const fields: Record<string, string[]> = {}

  error.issues.forEach((issue) => {
    const field = issue.path[0]?.toString() ?? 'form'
    fields[field] = [...(fields[field] ?? []), issue.message]
  })

  return {
    success: false,
    error: { message: '入力内容を確認してください', fields },
  }
}

async function requireUser(supabase: SupabaseClient): Promise<ActionFailure | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return { success: false, error: { message: '認証セッションが無効です' } }
  }
  return null
}

export async function loginAction(formData: FormData): Promise<ActionResult<RedirectData>> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return validationFailure(parsed.error)

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data)
  if (signInError) {
    return {
      success: false,
      error: { message: 'メールアドレスまたはパスワードが正しくありません' },
    }
  }

  const [assurance, factors] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ])
  if (assurance.error || factors.error) {
    return { success: false, error: { message: 'MFAの状態を確認できませんでした' } }
  }

  const redirectTo = getAuthDestination({
    isAuthenticated: true,
    currentLevel: assurance.data.currentLevel,
    hasVerifiedTotp: factors.data.totp.length > 0,
  })
  return { success: true, data: { redirectTo } }
}

export async function startTotpEnrollmentAction(): Promise<ActionResult<EnrollmentData>> {
  const supabase = await createClient()
  const authFailure = await requireUser(supabase)
  if (authFailure) return authFailure

  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
  if (factorsError) {
    return { success: false, error: { message: 'MFAの状態を確認できませんでした' } }
  }
  if (factors.totp.length > 0) {
    return { success: false, error: { message: 'MFAは既に設定されています' } }
  }

  const staleTotpFactors = factors.all.filter(
    (factor) => factor.factor_type === 'totp' && factor.status === 'unverified'
  )
  for (const factor of staleTotpFactors) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
    if (error) {
      return { success: false, error: { message: '以前のMFA登録をリセットできませんでした' } }
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'LiftDash',
  })
  if (error) return { success: false, error: { message: 'MFA登録を開始できませんでした' } }

  return {
    success: true,
    data: {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    },
  }
}

export async function verifyTotpEnrollmentAction(
  formData: FormData
): Promise<ActionResult<RedirectData>> {
  const parsed = totpEnrollmentSchema.safeParse({
    factorId: formData.get('factorId'),
    code: formData.get('code'),
  })
  if (!parsed.success) return validationFailure(parsed.error)

  const supabase = await createClient()
  const authFailure = await requireUser(supabase)
  if (authFailure) return authFailure

  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data)
  if (error) return { success: false, error: { message: '認証コードが正しくありません' } }

  return { success: true, data: { redirectTo: '/dashboard' } }
}

export async function verifyTotpChallengeAction(
  formData: FormData
): Promise<ActionResult<RedirectData>> {
  const parsed = totpCodeSchema.safeParse({ code: formData.get('code') })
  if (!parsed.success) return validationFailure(parsed.error)

  const supabase = await createClient()
  const authFailure = await requireUser(supabase)
  if (authFailure) return authFailure

  const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors()
  const factor = factors?.totp[0]
  if (factorError || !factor) {
    return { success: false, error: { message: '登録済みのMFA情報が見つかりません' } }
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: parsed.data.code,
  })
  if (error) return { success: false, error: { message: '認証コードが正しくありません' } }

  return { success: true, data: { redirectTo: '/dashboard' } }
}

export async function logoutAction(): Promise<ActionResult<RedirectData>> {
  const supabase = await createClient()
  const authFailure = await requireUser(supabase)
  if (authFailure) return authFailure

  const { error } = await supabase.auth.signOut()
  if (error) return { success: false, error: { message: 'ログアウトできませんでした' } }
  return { success: true, data: { redirectTo: '/login' } }
}
