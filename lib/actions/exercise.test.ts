import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  getAuthenticatorAssuranceLevel: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

import { createExerciseAction, deleteExerciseAction, updateExerciseAction } from './exercise'

function createFormData(values: Record<string, string>): FormData {
  const formData = new FormData()
  Object.entries(values).forEach(([name, value]) => formData.set(name, value))
  return formData
}

describe('exercise actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: mocks.getUser,
        mfa: { getAuthenticatorAssuranceLevel: mocks.getAuthenticatorAssuranceLevel },
      },
      from: mocks.from,
    })
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
      error: null,
    })
    mocks.from.mockReturnValue({
      insert: mocks.insert,
      update: mocks.update,
      delete: mocks.delete,
    })
    mocks.insert.mockReturnValue({ select: mocks.select })
    mocks.update.mockReturnValue({ eq: mocks.eq })
    mocks.delete.mockReturnValue({ eq: mocks.eq })
    mocks.eq.mockReturnValue({ select: mocks.select })
    mocks.select.mockReturnValue({ single: mocks.single })
  })

  it('creates a validated exercise and revalidates the list', async () => {
    mocks.single.mockResolvedValue({ data: { id: 'exercise-1' }, error: null })

    const result = await createExerciseAction(
      createFormData({ name: ' ベンチプレス ', muscleGroup: 'chest' })
    )

    expect(mocks.insert).toHaveBeenCalledWith({
      name: 'ベンチプレス',
      muscle_group: 'chest',
    })
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/exercises')
    expect(result).toEqual({ success: true, data: { id: 'exercise-1' } })
  })

  it('checks authentication before validating input', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await createExerciseAction(createFormData({ name: '', muscleGroup: 'invalid' }))

    expect(result).toEqual({
      success: false,
      error: { message: '認証セッションが無効です' },
    })
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('rejects direct writes from an aal1 session', async () => {
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    })

    const result = await createExerciseAction(
      createFormData({ name: 'ベンチプレス', muscleGroup: 'chest' })
    )

    expect(result).toEqual({ success: false, error: { message: 'MFA認証が必要です' } })
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('validates input after authorization and before querying the table', async () => {
    const result = await createExerciseAction(createFormData({ name: '', muscleGroup: 'invalid' }))

    expect(result.success).toBe(false)
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('updates an existing exercise', async () => {
    mocks.single.mockResolvedValue({
      data: { id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f' },
      error: null,
    })

    const result = await updateExerciseAction(
      createFormData({
        id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
        name: 'インクラインベンチプレス',
        muscleGroup: 'chest',
      })
    )

    expect(mocks.update).toHaveBeenCalledWith({
      name: 'インクラインベンチプレス',
      muscle_group: 'chest',
    })
    expect(mocks.eq).toHaveBeenCalledWith('id', '5f768f8b-91b9-473a-aeca-3d1934e26a8f')
    expect(result).toEqual({ success: true, data: undefined })
  })

  it('deletes an existing exercise', async () => {
    mocks.single.mockResolvedValue({
      data: { id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f' },
      error: null,
    })

    const result = await deleteExerciseAction(
      createFormData({ id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f' })
    )

    expect(mocks.delete).toHaveBeenCalledOnce()
    expect(mocks.eq).toHaveBeenCalledWith('id', '5f768f8b-91b9-473a-aeca-3d1934e26a8f')
    expect(result).toEqual({ success: true, data: undefined })
  })

  it('returns a safe error when Supabase rejects a write', async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: 'database detail' } })

    const result = await createExerciseAction(
      createFormData({ name: 'ベンチプレス', muscleGroup: 'chest' })
    )

    expect(result).toEqual({
      success: false,
      error: { message: '種目を登録できませんでした' },
    })
  })
})
