import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createWorkoutAction: vi.fn(),
  push: vi.fn(),
}))

vi.mock('@/lib/actions/workout', () => ({ createWorkoutAction: mocks.createWorkoutAction }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))

import { WorkoutForm } from './WorkoutForm'

const EXERCISES = [
  {
    id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
    name: 'ベンチプレス',
    muscle_group: 'chest' as const,
    created_at: '2026-06-27T00:00:00Z',
    updated_at: '2026-06-27T00:00:00Z',
  },
  {
    id: '2b994e6c-2e61-4dc1-a1b2-b641868c07c8',
    name: 'スクワット',
    muscle_group: 'legs' as const,
    created_at: '2026-06-27T00:00:00Z',
    updated_at: '2026-06-27T00:00:00Z',
  },
]

describe('WorkoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date(2026, 6, 4, 12))
  })

  it('defaults the session date to the browser local date', () => {
    render(<WorkoutForm exercises={EXERCISES} />)

    expect(screen.getByLabelText('トレーニング日')).toHaveValue('2026-07-04')
  })

  it('adds exercises and adds or removes sets without allowing an empty exercise', () => {
    render(<WorkoutForm exercises={EXERCISES} />)

    fireEvent.click(screen.getByRole('button', { name: '種目を追加' }))
    expect(screen.getAllByRole('group', { name: /種目/ })).toHaveLength(2)

    const firstExercise = screen.getAllByRole('group', { name: /種目/ })[0]
    if (!firstExercise) throw new Error('Expected first exercise group')
    const addSet = within(firstExercise).getByRole('button', { name: 'セットを追加' })
    const removeSet = within(firstExercise).getByRole('button', { name: 'セットを削除' })

    expect(removeSet).toBeDisabled()
    fireEvent.click(addSet)
    expect(within(firstExercise).getAllByLabelText(/重量/)).toHaveLength(2)
    expect(removeSet).toBeEnabled()
    fireEvent.click(removeSet)
    expect(within(firstExercise).getAllByLabelText(/重量/)).toHaveLength(1)
  })

  it('submits the structured workout and navigates to its date detail', async () => {
    mocks.createWorkoutAction.mockResolvedValue({
      success: true,
      data: { id: 'session-1', date: '2026-07-04' },
    })
    render(<WorkoutForm exercises={EXERCISES} />)

    fireEvent.change(screen.getByLabelText('セット1の重量（kg）'), {
      target: { value: '60.5' },
    })
    fireEvent.change(screen.getByLabelText('セット1のレップ数'), {
      target: { value: '10' },
    })
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '胸の日' } })
    fireEvent.click(screen.getByRole('button', { name: '記録を保存' }))

    await waitFor(() => expect(mocks.createWorkoutAction).toHaveBeenCalledOnce())
    const formData = mocks.createWorkoutAction.mock.calls[0]?.[0]
    expect(formData).toBeInstanceOf(FormData)
    if (!(formData instanceof FormData)) throw new Error('Expected FormData')
    expect(JSON.parse(String(formData.get('payload')))).toEqual({
      date: '2026-07-04',
      notes: '胸の日',
      exercises: [
        {
          exerciseId: EXERCISES[0]?.id,
          sets: [{ weight: 60.5, reps: 10 }],
        },
      ],
    })
    expect(mocks.push).toHaveBeenCalledWith('/log/2026-07-04')
  })

  it('shows a safe action error', async () => {
    mocks.createWorkoutAction.mockResolvedValue({
      success: false,
      error: { message: 'トレーニング記録を保存できませんでした' },
    })
    render(<WorkoutForm exercises={EXERCISES} />)

    fireEvent.change(screen.getByLabelText('セット1の重量（kg）'), {
      target: { value: '60' },
    })
    fireEvent.change(screen.getByLabelText('セット1のレップ数'), {
      target: { value: '10' },
    })
    fireEvent.click(screen.getByRole('button', { name: '記録を保存' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'トレーニング記録を保存できませんでした'
    )
  })
})
