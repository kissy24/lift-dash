import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  orderDate: vi.fn(),
  orderCreatedAt: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))

import WorkoutLogPage from './page'

describe('WorkoutLogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockReturnValue({ select: mocks.select })
    mocks.select.mockReturnValue({ order: mocks.orderDate })
    mocks.orderDate.mockReturnValue({ order: mocks.orderCreatedAt })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('groups sessions into descending recorded dates', async () => {
    mocks.orderCreatedAt.mockResolvedValue({
      data: [
        { id: 'session-2', date: '2026-07-05', workout_sets: [{ weight: 100, reps: 5 }] },
        { id: 'session-1', date: '2026-07-04', workout_sets: [{ weight: 60, reps: 10 }] },
      ],
      error: null,
    })

    render(await WorkoutLogPage({}))

    expect(screen.getByRole('heading', { level: 1, name: 'トレーニング記録' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /2026年7月5日/ })).toHaveAttribute(
      'href',
      '/log/2026-07-05'
    )
    expect(screen.getByText('合計ボリューム 500 kg')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '2026年7月' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /2026-07-05/ })).toHaveAttribute(
      'href',
      '/log/2026-07-05'
    )
  })

  it('uses the month query for calendar navigation', async () => {
    mocks.orderCreatedAt.mockResolvedValue({
      data: [{ id: 'session-1', date: '2026-08-10', workout_sets: [{ weight: 80, reps: 5 }] }],
      error: null,
    })

    render(await WorkoutLogPage({ searchParams: Promise.resolve({ month: '2026-08' }) }))

    expect(screen.getByRole('heading', { level: 2, name: '2026年8月' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '前月' })).toHaveAttribute('href', '/log?month=2026-07')
    expect(screen.getByRole('link', { name: '翌月' })).toHaveAttribute('href', '/log?month=2026-09')
  })

  it('falls back to the current month when the month query is invalid', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15))
    mocks.orderCreatedAt.mockResolvedValue({ data: [], error: null })

    render(await WorkoutLogPage({ searchParams: Promise.resolve({ month: 'bad-query' }) }))

    expect(screen.getByRole('heading', { level: 2, name: '2026年1月' })).toBeInTheDocument()
  })

  it('renders an empty state with an entry link', async () => {
    mocks.orderCreatedAt.mockResolvedValue({ data: [], error: null })

    render(await WorkoutLogPage({}))

    expect(screen.getByText('記録がまだありません')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '最初の記録を追加' })).toHaveAttribute(
      'href',
      '/log/new'
    )
  })
})
