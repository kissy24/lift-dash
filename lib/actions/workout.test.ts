import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  getAuthenticatorAssuranceLevel: vi.fn(),
  rpc: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

import { createWorkoutAction } from './workout'

const VALID_PAYLOAD = {
  date: '2026-07-04',
  notes: '胸の日',
  exercises: [
    {
      exerciseId: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
      sets: [
        { weight: 60, reps: 10 },
        { weight: 55.5, reps: 12 },
      ],
    },
  ],
}

function payloadFormData(payload: unknown): FormData {
  const formData = new FormData()
  formData.set('payload', JSON.stringify(payload))
  return formData
}

describe('createWorkoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: mocks.getUser,
        mfa: { getAuthenticatorAssuranceLevel: mocks.getAuthenticatorAssuranceLevel },
      },
      rpc: mocks.rpc,
    })
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
      error: null,
    })
  })

  it('atomically creates a validated session and its numbered sets', async () => {
    mocks.rpc.mockResolvedValue({
      data: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634',
      error: null,
    })

    const result = await createWorkoutAction(payloadFormData(VALID_PAYLOAD))

    expect(mocks.rpc).toHaveBeenCalledWith('create_workout_session', {
      p_date: '2026-07-04',
      p_notes: '胸の日',
      p_sets: [
        {
          exercise_id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
          set_number: 1,
          weight: 60,
          reps: 10,
        },
        {
          exercise_id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
          set_number: 2,
          weight: 55.5,
          reps: 12,
        },
      ],
    })
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/log')
    expect(result).toEqual({
      success: true,
      data: { id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634', date: '2026-07-04' },
    })
  })

  it('checks authentication before parsing the payload', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })
    const formData = new FormData()
    formData.set('payload', '{invalid json')

    const result = await createWorkoutAction(formData)

    expect(result).toEqual({
      success: false,
      error: { message: '認証セッションが無効です' },
    })
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it('rejects direct writes from an aal1 session', async () => {
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    })

    const result = await createWorkoutAction(payloadFormData(VALID_PAYLOAD))

    expect(result).toEqual({ success: false, error: { message: 'MFA認証が必要です' } })
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it('rejects an invalid payload before calling the database', async () => {
    const result = await createWorkoutAction(payloadFormData({ ...VALID_PAYLOAD, exercises: [] }))

    expect(result).toMatchObject({
      success: false,
      error: { message: '入力内容を確認してください' },
    })
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it('returns a safe error when the transaction fails', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'database detail' } })

    const result = await createWorkoutAction(payloadFormData(VALID_PAYLOAD))

    expect(result).toEqual({
      success: false,
      error: { message: 'トレーニング記録を保存できませんでした' },
    })
  })
})
