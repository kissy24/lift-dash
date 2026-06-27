import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
  getAuthenticatorAssuranceLevel: vi.fn(),
  listFactors: vi.fn(),
  enroll: vi.fn(),
  unenroll: vi.fn(),
  challengeAndVerify: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))

import {
  loginAction,
  logoutAction,
  startTotpEnrollmentAction,
  verifyTotpChallengeAction,
  verifyTotpEnrollmentAction,
} from './auth'

function createFormData(values: Record<string, string>): FormData {
  const formData = new FormData()
  Object.entries(values).forEach(([name, value]) => formData.set(name, value))
  return formData
}

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({
      auth: {
        signInWithPassword: mocks.signInWithPassword,
        signOut: mocks.signOut,
        getUser: mocks.getUser,
        mfa: {
          getAuthenticatorAssuranceLevel: mocks.getAuthenticatorAssuranceLevel,
          listFactors: mocks.listFactors,
          enroll: mocks.enroll,
          unenroll: mocks.unenroll,
          challengeAndVerify: mocks.challengeAndVerify,
        },
      },
    })
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  })

  it('validates login input before contacting Supabase', async () => {
    const result = await loginAction(createFormData({ email: 'invalid', password: '' }))

    expect(result.success).toBe(false)
    expect(mocks.createClient).not.toHaveBeenCalled()
  })

  it('routes a password-authenticated user with TOTP to verification', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null })
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    })
    mocks.listFactors.mockResolvedValue({
      data: { totp: [{ id: 'factor-1', status: 'verified' }] },
      error: null,
    })

    const result = await loginAction(
      createFormData({ email: 'owner@example.com', password: 'password123' })
    )

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'owner@example.com',
      password: 'password123',
    })
    expect(result).toEqual({ success: true, data: { redirectTo: '/mfa/verify' } })
  })

  it('starts TOTP enrollment for an authenticated user', async () => {
    mocks.listFactors.mockResolvedValue({ data: { all: [], totp: [] }, error: null })
    mocks.enroll.mockResolvedValue({
      data: {
        id: 'factor-1',
        totp: { qr_code: 'data:image/svg+xml;base64,abc', secret: 'SECRET' },
      },
      error: null,
    })

    const result = await startTotpEnrollmentAction()

    expect(mocks.enroll).toHaveBeenCalledWith({
      factorType: 'totp',
      friendlyName: 'LiftDash',
    })
    expect(result).toEqual({
      success: true,
      data: {
        factorId: 'factor-1',
        qrCode: 'data:image/svg+xml;base64,abc',
        secret: 'SECRET',
      },
    })
  })

  it('removes a stale unverified TOTP factor before restarting enrollment', async () => {
    mocks.listFactors.mockResolvedValue({
      data: {
        all: [{ id: 'stale-factor', factor_type: 'totp', status: 'unverified' }],
        totp: [],
      },
      error: null,
    })
    mocks.unenroll.mockResolvedValue({ error: null })
    mocks.enroll.mockResolvedValue({
      data: {
        id: 'factor-2',
        totp: { qr_code: 'data:image/svg+xml;base64,new', secret: 'NEWSECRET' },
      },
      error: null,
    })

    await startTotpEnrollmentAction()

    expect(mocks.unenroll).toHaveBeenCalledWith({ factorId: 'stale-factor' })
    expect(mocks.enroll).toHaveBeenCalledAfter(mocks.unenroll)
  })

  it('rejects enrollment when a verified TOTP factor already exists', async () => {
    mocks.listFactors.mockResolvedValue({
      data: {
        all: [{ id: 'verified-factor', factor_type: 'totp', status: 'verified' }],
        totp: [{ id: 'verified-factor', factor_type: 'totp', status: 'verified' }],
      },
      error: null,
    })

    const result = await startTotpEnrollmentAction()

    expect(result).toEqual({
      success: false,
      error: { message: 'MFAは既に設定されています' },
    })
    expect(mocks.unenroll).not.toHaveBeenCalled()
    expect(mocks.enroll).not.toHaveBeenCalled()
  })

  it('verifies a newly enrolled factor', async () => {
    mocks.challengeAndVerify.mockResolvedValue({ error: null })
    const formData = createFormData({ factorId: 'factor-1', code: '123456' })

    const result = await verifyTotpEnrollmentAction(formData)

    expect(mocks.challengeAndVerify).toHaveBeenCalledWith({
      factorId: 'factor-1',
      code: '123456',
    })
    expect(result).toEqual({ success: true, data: { redirectTo: '/dashboard' } })
  })

  it('uses the verified TOTP factor for a login challenge', async () => {
    mocks.listFactors.mockResolvedValue({
      data: { totp: [{ id: 'factor-1', status: 'verified' }] },
      error: null,
    })
    mocks.challengeAndVerify.mockResolvedValue({ error: null })

    const result = await verifyTotpChallengeAction(createFormData({ code: '123456' }))

    expect(mocks.challengeAndVerify).toHaveBeenCalledWith({
      factorId: 'factor-1',
      code: '123456',
    })
    expect(result).toEqual({ success: true, data: { redirectTo: '/dashboard' } })
  })

  it('signs out an authenticated session', async () => {
    mocks.signOut.mockResolvedValue({ error: null })

    expect(await logoutAction()).toEqual({ success: true, data: { redirectTo: '/login' } })
    expect(mocks.signOut).toHaveBeenCalledOnce()
  })
})
