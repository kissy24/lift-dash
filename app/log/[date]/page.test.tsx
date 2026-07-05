import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  sessionsSelect: vi.fn(),
  sessionsEq: vi.fn(),
  sessionsOrder: vi.fn(),
  exercisesSelect: vi.fn(),
  exercisesOrder: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@/lib/actions/workout', () => ({
  createWorkoutAction: vi.fn(),
  updateWorkoutAction: vi.fn(),
  deleteWorkoutSessionAction: vi.fn(),
  updateWorkoutSetAction: vi.fn(),
  deleteWorkoutSetAction: vi.fn(),
}))

import WorkoutDatePage from './page'

describe('WorkoutDatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockImplementation((table: string) =>
      table === 'workout_sessions'
        ? { select: mocks.sessionsSelect }
        : { select: mocks.exercisesSelect }
    )
    mocks.sessionsSelect.mockReturnValue({ eq: mocks.sessionsEq })
    mocks.sessionsEq.mockReturnValue({ order: mocks.sessionsOrder })
    mocks.exercisesSelect.mockReturnValue({ order: mocks.exercisesOrder })
    mocks.exercisesOrder.mockResolvedValue({ data: [], error: null })
  })

  it('renders all sessions and set details for the date', async () => {
    mocks.sessionsOrder.mockResolvedValue({
      data: [
        {
          id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634',
          date: '2026-07-05',
          notes: '胸の日',
          created_at: '2026-07-05T01:00:00Z',
          workout_sets: [
            {
              id: '40a4ed9d-a784-4f23-95d1-d8b0c5859a63',
              exercise_id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
              set_number: 1,
              weight: 80,
              reps: 5,
              exercise: { id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f', name: 'ベンチプレス' },
            },
          ],
        },
      ],
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

    render(await WorkoutDatePage({ params: Promise.resolve({ date: '2026-07-05' }) }))

    expect(
      screen.getByRole('heading', { level: 1, name: '2026年7月5日の記録' })
    ).toBeInTheDocument()
    expect(screen.getByText('ベンチプレス')).toBeInTheDocument()
    expect(screen.getByDisplayValue('80')).toBeInTheDocument()
  })

  it('returns not found for an invalid date before querying', async () => {
    await expect(
      WorkoutDatePage({ params: Promise.resolve({ date: '2026-02-30' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mocks.from).not.toHaveBeenCalled()
  })
})
