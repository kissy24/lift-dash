import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  selectSessions: vi.fn(),
  orderDate: vi.fn(),
  orderCreatedAt: vi.fn(),
  selectExercises: vi.fn(),
  orderExercises: vi.fn(),
}))

vi.mock('@/components/forms/LogoutButton', () => ({
  LogoutButton: () => <button type="button">ログアウト</button>,
}))
vi.mock('@/components/charts/DashboardCharts', () => ({
  DashboardCharts: ({
    metrics,
  }: {
    metrics: {
      frequency: Array<{ date: string; sessionCount: number }>
      maxWeightByExercise: Array<{ exerciseName: string }>
    }
  }) => (
    <section>
      <h2>ダッシュボード指標</h2>
      <p>{metrics.frequency.filter((day) => day.sessionCount > 0).length}日分</p>
      <p>グラフ:{metrics.maxWeightByExercise.map((item) => item.exerciseName).join(',')}</p>
    </section>
  ),
}))
vi.mock('@/components/workouts/PersonalRecordCards', () => ({
  PersonalRecordCards: ({ records }: { records: Array<{ exerciseName: string }> }) => (
    <section>
      <h2>自己ベスト</h2>
      <p>PR:{records.map((record) => record.exerciseName).join(',')}</p>
    </section>
  ),
}))
vi.mock('@/components/workouts/DashboardFilters', () => ({
  DashboardFilters: ({
    filters,
    exercises,
  }: {
    filters: { range: string; exerciseId: string | null }
    exercises: Array<{ name: string }>
  }) => (
    <section>
      <h2>表示フィルター</h2>
      <p>
        {filters.range}:{filters.exerciseId ?? 'all'}:{exercises.map((item) => item.name).join(',')}
      </p>
    </section>
  ),
}))
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))

import DashboardPage from './page'

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockImplementation((table: string) =>
      table === 'workout_sessions'
        ? { select: mocks.selectSessions }
        : { select: mocks.selectExercises }
    )
    mocks.selectSessions.mockReturnValue({ order: mocks.orderDate })
    mocks.orderDate.mockReturnValue({ order: mocks.orderCreatedAt })
    mocks.orderCreatedAt.mockResolvedValue({ data: [], error: null })
    mocks.selectExercises.mockReturnValue({ order: mocks.orderExercises })
    mocks.orderExercises.mockResolvedValue({
      data: [
        { id: 'bench', name: 'ベンチプレス' },
        { id: 'squat', name: 'スクワット' },
      ],
      error: null,
    })
  })

  it('links to the manual workout entry page', async () => {
    render(await DashboardPage({ searchParams: Promise.resolve({}) }))

    expect(screen.getByRole('link', { name: '記録を追加' })).toHaveAttribute('href', '/log/new')
    expect(screen.getByRole('link', { name: '記録一覧' })).toHaveAttribute('href', '/log')
    expect(screen.getByRole('link', { name: 'プリセット' })).toHaveAttribute('href', '/presets')
  })

  it('loads exercises and applies the same filters to metrics and personal records', async () => {
    mocks.orderCreatedAt.mockResolvedValue({
      data: [
        {
          id: 'session-1',
          date: '2026-07-01',
          created_at: '2026-07-01T09:00:00Z',
          workout_sets: [
            {
              id: 'set-1',
              weight: 60,
              reps: 10,
              created_at: '2026-07-01T09:01:00Z',
              exercises: { id: 'bench', name: 'ベンチプレス', muscle_group: 'chest' },
            },
            {
              id: 'set-2',
              weight: 100,
              reps: 5,
              created_at: '2026-07-01T09:02:00Z',
              exercises: { id: 'squat', name: 'スクワット', muscle_group: 'legs' },
            },
          ],
        },
      ],
      error: null,
    })

    render(
      await DashboardPage({
        searchParams: Promise.resolve({ range: 'all', exercise: 'bench' }),
      })
    )

    expect(mocks.from).toHaveBeenCalledWith('workout_sessions')
    expect(mocks.from).toHaveBeenCalledWith('exercises')
    expect(mocks.selectSessions).toHaveBeenCalledWith(
      'id,date,created_at,workout_sets(id,weight,reps,created_at,exercises(id,name,muscle_group))'
    )
    expect(mocks.selectExercises).toHaveBeenCalledWith('id,name')
    expect(screen.getByText('all:bench:ベンチプレス,スクワット')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ダッシュボード指標' })).toBeInTheDocument()
    expect(screen.getByText('1日分')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '自己ベスト' })).toBeInTheDocument()
    expect(screen.getByText('グラフ:ベンチプレス')).toBeInTheDocument()
    expect(screen.getByText('PR:ベンチプレス')).toBeInTheDocument()
    expect(screen.queryByText(/グラフ:.*スクワット/)).not.toBeInTheDocument()
  })
})
