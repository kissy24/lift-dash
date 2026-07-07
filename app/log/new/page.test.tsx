import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  exercisesSelect: vi.fn(),
  exercisesOrder: vi.fn(),
  presetsSelect: vi.fn(),
  presetsOrder: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('@/lib/actions/workout', () => ({
  createWorkoutAction: vi.fn(),
  updateWorkoutAction: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import NewWorkoutPage from './page'

describe('NewWorkoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockImplementation((table: string) =>
      table === 'exercises' ? { select: mocks.exercisesSelect } : { select: mocks.presetsSelect }
    )
    mocks.exercisesSelect.mockReturnValue({ order: mocks.exercisesOrder })
    mocks.presetsSelect.mockReturnValue({ order: mocks.presetsOrder })
    mocks.presetsOrder.mockResolvedValue({ data: [], error: null })
  })

  it('loads exercises and renders the manual workout form', async () => {
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
    mocks.presetsOrder.mockResolvedValue({
      data: [
        {
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
      ],
      error: null,
    })

    render(await NewWorkoutPage())

    expect(screen.getByRole('heading', { level: 1, name: 'トレーニング記録' })).toBeInTheDocument()
    expect(screen.getByLabelText('種目')).toHaveValue('5f768f8b-91b9-473a-aeca-3d1934e26a8f')
    expect(screen.getByRole('option', { name: '胸の日' })).toBeInTheDocument()
    expect(mocks.from).toHaveBeenCalledWith('exercises')
    expect(mocks.from).toHaveBeenCalledWith('presets')
  })

  it('guides the user to create an exercise when the master is empty', async () => {
    mocks.exercisesOrder.mockResolvedValue({ data: [], error: null })

    render(await NewWorkoutPage())

    expect(screen.getByRole('link', { name: '種目を登録' })).toHaveAttribute('href', '/exercises')
  })

  it('throws a safe error when exercises cannot be loaded', async () => {
    mocks.exercisesOrder.mockResolvedValue({
      data: null,
      error: { message: 'database detail' },
    })

    await expect(NewWorkoutPage()).rejects.toThrow('種目一覧を取得できませんでした')
  })

  it('throws a safe error when presets cannot be loaded', async () => {
    mocks.exercisesOrder.mockResolvedValue({ data: [], error: null })
    mocks.presetsOrder.mockResolvedValue({ data: null, error: { message: 'database detail' } })

    await expect(NewWorkoutPage()).rejects.toThrow('プリセット一覧を取得できませんでした')
  })
})
