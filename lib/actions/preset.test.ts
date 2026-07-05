import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  getAuthenticatorAssuranceLevel: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

import { createPresetAction, deletePresetAction, updatePresetAction } from './preset'

const VALID_PAYLOAD = {
  name: '胸の日',
  items: [
    {
      exerciseId: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
      defaultWeight: 60,
      defaultReps: 10,
      defaultSets: 3,
    },
  ],
}

function payloadFormData(payload: unknown): FormData {
  const formData = new FormData()
  formData.set('payload', JSON.stringify(payload))
  return formData
}

describe('preset actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: mocks.getUser,
        mfa: { getAuthenticatorAssuranceLevel: mocks.getAuthenticatorAssuranceLevel },
      },
      rpc: mocks.rpc,
      from: mocks.from,
    })
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
      error: null,
    })
    mocks.from.mockReturnValue({ delete: mocks.delete })
    mocks.delete.mockReturnValue({ eq: mocks.eq })
    mocks.eq.mockReturnValue({ select: mocks.select })
    mocks.select.mockReturnValue({ single: mocks.single })
  })

  it('atomically creates ordered preset items', async () => {
    mocks.rpc.mockResolvedValue({
      data: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634',
      error: null,
    })

    const result = await createPresetAction(payloadFormData(VALID_PAYLOAD))

    expect(mocks.rpc).toHaveBeenCalledWith('create_preset', {
      p_name: '胸の日',
      p_items: [
        {
          exercise_id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
          order_index: 0,
          default_weight: 60,
          default_reps: 10,
          default_sets: 3,
        },
      ],
    })
    expect(result).toEqual({
      success: true,
      data: { id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634' },
    })
  })

  it('checks authentication before parsing input', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await createPresetAction(payloadFormData({ name: '', items: [] }))

    expect(result).toEqual({
      success: false,
      error: { message: '認証セッションが無効です' },
    })
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it('atomically updates a preset and its order', async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null })
    const payload = { ...VALID_PAYLOAD, id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634' }

    const result = await updatePresetAction(payloadFormData(payload))

    expect(mocks.rpc).toHaveBeenCalledWith(
      'update_preset',
      expect.objectContaining({ p_preset_id: payload.id, p_name: '胸の日' })
    )
    expect(result).toEqual({ success: true, data: { id: payload.id } })
  })

  it('deletes a preset whose items cascade', async () => {
    mocks.single.mockResolvedValue({
      data: { id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634' },
      error: null,
    })
    const formData = new FormData()
    formData.set('id', '15d7ac4f-e9b1-48a0-a2b1-a589b893b634')

    const result = await deletePresetAction(formData)

    expect(mocks.from).toHaveBeenCalledWith('presets')
    expect(mocks.delete).toHaveBeenCalledOnce()
    expect(result).toEqual({ success: true, data: undefined })
  })
})
