import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  order: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('@/lib/actions/workout', () => ({ createWorkoutAction: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import NewWorkoutPage from './page'

describe('NewWorkoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockReturnValue({ select: mocks.select })
    mocks.select.mockReturnValue({ order: mocks.order })
  })

  it('loads exercises and renders the manual workout form', async () => {
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

    render(await NewWorkoutPage())

    expect(screen.getByRole('heading', { level: 1, name: 'トレーニング記録' })).toBeInTheDocument()
    expect(screen.getByLabelText('種目')).toHaveValue('5f768f8b-91b9-473a-aeca-3d1934e26a8f')
    expect(mocks.from).toHaveBeenCalledWith('exercises')
  })

  it('guides the user to create an exercise when the master is empty', async () => {
    mocks.order.mockResolvedValue({ data: [], error: null })

    render(await NewWorkoutPage())

    expect(screen.getByRole('link', { name: '種目を登録' })).toHaveAttribute('href', '/exercises')
  })

  it('throws a safe error when exercises cannot be loaded', async () => {
    mocks.order.mockResolvedValue({ data: null, error: { message: 'database detail' } })

    await expect(NewWorkoutPage()).rejects.toThrow('種目一覧を取得できませんでした')
  })
})
