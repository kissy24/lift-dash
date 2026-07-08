import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  orderDate: vi.fn(),
  orderCreatedAt: vi.fn(),
}))

vi.mock('@/components/forms/LogoutButton', () => ({
  LogoutButton: () => <button type="button">ログアウト</button>,
}))
vi.mock('@/components/charts/DashboardCharts', () => ({
  DashboardCharts: ({
    metrics,
  }: {
    metrics: { frequency: Array<{ date: string; sessionCount: number }> }
  }) => (
    <section>
      <h2>ダッシュボード指標</h2>
      <p>{metrics.frequency.filter((day) => day.sessionCount > 0).length}日分</p>
    </section>
  ),
}))
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))

import DashboardPage from './page'

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockReturnValue({ select: mocks.select })
    mocks.select.mockReturnValue({ order: mocks.orderDate })
    mocks.orderDate.mockReturnValue({ order: mocks.orderCreatedAt })
    mocks.orderCreatedAt.mockResolvedValue({ data: [], error: null })
  })

  it('links to the manual workout entry page', async () => {
    render(await DashboardPage())

    expect(screen.getByRole('link', { name: '記録を追加' })).toHaveAttribute('href', '/log/new')
    expect(screen.getByRole('link', { name: '記録一覧' })).toHaveAttribute('href', '/log')
    expect(screen.getByRole('link', { name: 'プリセット' })).toHaveAttribute('href', '/presets')
  })

  it('loads workout sessions and renders dashboard metrics', async () => {
    mocks.orderCreatedAt.mockResolvedValue({
      data: [
        {
          id: 'session-1',
          date: '2026-07-01',
          workout_sets: [
            {
              id: 'set-1',
              weight: 60,
              reps: 10,
              exercises: { id: 'bench', name: 'ベンチプレス', muscle_group: 'chest' },
            },
          ],
        },
      ],
      error: null,
    })

    render(await DashboardPage())

    expect(mocks.from).toHaveBeenCalledWith('workout_sessions')
    expect(mocks.select).toHaveBeenCalledWith(
      'id,date,workout_sets(id,weight,reps,exercises(id,name,muscle_group))'
    )
    expect(screen.getByRole('heading', { name: 'ダッシュボード指標' })).toBeInTheDocument()
    expect(screen.getByText('1日分')).toBeInTheDocument()
  })
})
