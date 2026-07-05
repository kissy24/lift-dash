import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  deleteWorkoutSessionAction: vi.fn(),
  updateWorkoutSetAction: vi.fn(),
  deleteWorkoutSetAction: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  confirm: vi.fn(),
}))

vi.mock('@/lib/actions/workout', () => ({
  deleteWorkoutSessionAction: mocks.deleteWorkoutSessionAction,
  updateWorkoutSetAction: mocks.updateWorkoutSetAction,
  deleteWorkoutSetAction: mocks.deleteWorkoutSetAction,
  createWorkoutAction: vi.fn(),
  updateWorkoutAction: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}))

import { WorkoutSessionCard } from './WorkoutSessionCard'

const SESSION = {
  id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634',
  date: '2026-07-05',
  notes: '胸の日',
  exercises: [
    {
      exerciseId: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
      exerciseName: 'ベンチプレス',
      sets: [
        {
          id: '40a4ed9d-a784-4f23-95d1-d8b0c5859a63',
          setNumber: 1,
          weight: 80,
          reps: 5,
        },
      ],
    },
  ],
}

const EXERCISES = [
  {
    id: SESSION.exercises[0]?.exerciseId ?? '',
    name: 'ベンチプレス',
    muscle_group: 'chest' as const,
    created_at: '2026-06-27T00:00:00Z',
    updated_at: '2026-06-27T00:00:00Z',
  },
]

describe('WorkoutSessionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.confirm.mockReturnValue(true)
    vi.stubGlobal('confirm', mocks.confirm)
  })

  it('shows session, exercise and set details', () => {
    render(<WorkoutSessionCard session={SESSION} exercises={EXERCISES} sessionNumber={1} />)

    expect(screen.getByRole('heading', { name: 'セッション 1' })).toBeInTheDocument()
    expect(screen.getByText('胸の日')).toBeInTheDocument()
    expect(screen.getByText('ベンチプレス')).toBeInTheDocument()
    expect(screen.getByDisplayValue('80')).toBeInTheDocument()
  })

  it('updates an individual set', async () => {
    mocks.updateWorkoutSetAction.mockResolvedValue({ success: true, data: undefined })
    render(<WorkoutSessionCard session={SESSION} exercises={EXERCISES} sessionNumber={1} />)

    fireEvent.change(screen.getByLabelText('セット1の重量（kg）'), {
      target: { value: '82.5' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'セット1を保存' }))

    await waitFor(() => expect(mocks.updateWorkoutSetAction).toHaveBeenCalledOnce())
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })

  it('shows the safe error when the final set cannot be deleted', async () => {
    mocks.deleteWorkoutSetAction.mockResolvedValue({
      success: false,
      error: { message: '最後のセットは削除できません。セッションを削除してください' },
    })
    render(<WorkoutSessionCard session={SESSION} exercises={EXERCISES} sessionNumber={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'セット1を削除' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('最後のセットは削除できません')
  })

  it('deletes the entire session after confirmation', async () => {
    mocks.deleteWorkoutSessionAction.mockResolvedValue({ success: true, data: undefined })
    render(<WorkoutSessionCard session={SESSION} exercises={EXERCISES} sessionNumber={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'セッションを削除' }))

    await waitFor(() => expect(mocks.deleteWorkoutSessionAction).toHaveBeenCalledOnce())
    expect(mocks.confirm).toHaveBeenCalledOnce()
    expect(mocks.push).toHaveBeenCalledWith('/log')
  })

  it('switches to the full session edit form', () => {
    render(<WorkoutSessionCard session={SESSION} exercises={EXERCISES} sessionNumber={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'セッションを編集' }))

    expect(screen.getByRole('button', { name: '変更を保存' })).toBeInTheDocument()
  })
})
