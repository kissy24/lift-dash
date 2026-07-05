import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  presetSelect: vi.fn(),
  presetEq: vi.fn(),
  presetSingle: vi.fn(),
  exercisesSelect: vi.fn(),
  exercisesOrder: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('@/lib/actions/preset', () => ({
  createPresetAction: vi.fn(),
  updatePresetAction: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ push: vi.fn() }),
}))

import EditPresetPage from './page'

describe('EditPresetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockImplementation((table: string) =>
      table === 'presets' ? { select: mocks.presetSelect } : { select: mocks.exercisesSelect }
    )
    mocks.presetSelect.mockReturnValue({ eq: mocks.presetEq })
    mocks.presetEq.mockReturnValue({ single: mocks.presetSingle })
    mocks.exercisesSelect.mockReturnValue({ order: mocks.exercisesOrder })
  })

  it('loads the preset and exercises into the edit form', async () => {
    mocks.presetSingle.mockResolvedValue({
      data: {
        id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634',
        name: '胸の日',
        preset_items: [
          {
            exercise_id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
            order_index: 0,
            default_weight: 60,
            default_reps: 10,
            default_sets: 3,
          },
        ],
      },
      error: null,
    })
    mocks.exercisesOrder.mockResolvedValue({
      data: [
        {
          id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
          name: 'ベンチプレス',
          muscle_group: 'chest',
          created_at: '2026-06-27T00:00:00Z',
          updated_at: '2026-06-27T00:00:00Z',
        },
      ],
      error: null,
    })

    render(
      await EditPresetPage({
        params: Promise.resolve({ id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634' }),
      })
    )

    expect(screen.getByRole('heading', { name: 'プリセットを編集' })).toBeInTheDocument()
    expect(screen.getByLabelText('プリセット名')).toHaveValue('胸の日')
    expect(screen.getByLabelText('デフォルト重量（kg）')).toHaveValue(60)
  })

  it('returns not found for an invalid id before querying', async () => {
    await expect(EditPresetPage({ params: Promise.resolve({ id: 'invalid' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
    expect(mocks.from).not.toHaveBeenCalled()
  })
})
