import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  order: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('@/lib/actions/exercise', () => ({
  createExerciseAction: vi.fn(),
  updateExerciseAction: vi.fn(),
  deleteExerciseAction: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mocks.refresh }) }))

import ExercisesPage from './page'

describe('ExercisesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockReturnValue({ select: mocks.select })
    mocks.select.mockReturnValue({ order: mocks.order })
  })

  it('renders exercises returned by the server query', async () => {
    mocks.order.mockResolvedValue({
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

    render(await ExercisesPage())

    expect(screen.getByRole('heading', { level: 1, name: '種目マスタ' })).toBeInTheDocument()
    expect(screen.getByText('ベンチプレス')).toBeInTheDocument()
    expect(mocks.from).toHaveBeenCalledWith('exercises')
    expect(mocks.order).toHaveBeenCalledWith('name', { ascending: true })
  })

  it('throws a safe error when the server query fails', async () => {
    mocks.order.mockResolvedValue({ data: null, error: { message: 'database detail' } })

    await expect(ExercisesPage()).rejects.toThrow('種目一覧を取得できませんでした')
  })
})
