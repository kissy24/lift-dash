import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createExerciseAction: vi.fn(),
  updateExerciseAction: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/lib/actions/exercise', () => ({
  createExerciseAction: mocks.createExerciseAction,
  updateExerciseAction: mocks.updateExerciseAction,
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mocks.refresh }) }))

import { ExerciseForm } from './ExerciseForm'

describe('ExerciseForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates an exercise', async () => {
    mocks.createExerciseAction.mockResolvedValue({
      success: true,
      data: { id: 'exercise-1' },
    })
    render(<ExerciseForm />)

    fireEvent.change(screen.getByLabelText('種目名'), { target: { value: 'ベンチプレス' } })
    fireEvent.change(screen.getByLabelText('筋肉部位'), { target: { value: 'chest' } })
    fireEvent.click(screen.getByRole('button', { name: '種目を登録' }))

    await waitFor(() => expect(mocks.createExerciseAction).toHaveBeenCalledOnce())
    const formData = mocks.createExerciseAction.mock.calls[0]?.[0]
    expect(formData).toBeInstanceOf(FormData)
    if (!(formData instanceof FormData)) throw new Error('Expected FormData')
    expect(formData.get('name')).toBe('ベンチプレス')
    expect(formData.get('muscleGroup')).toBe('chest')
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })

  it('updates an exercise and includes its id', async () => {
    mocks.updateExerciseAction.mockResolvedValue({ success: true, data: undefined })
    render(
      <ExerciseForm
        exercise={{
          id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
          name: 'ベンチプレス',
          muscle_group: 'chest',
          created_at: '2026-06-27T00:00:00Z',
          updated_at: '2026-06-27T00:00:00Z',
        }}
      />
    )

    fireEvent.change(screen.getByLabelText('種目名'), {
      target: { value: 'インクラインベンチプレス' },
    })
    fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

    await waitFor(() => expect(mocks.updateExerciseAction).toHaveBeenCalledOnce())
    const formData = mocks.updateExerciseAction.mock.calls[0]?.[0]
    expect(formData).toBeInstanceOf(FormData)
    if (!(formData instanceof FormData)) throw new Error('Expected FormData')
    expect(formData.get('id')).toBe('5f768f8b-91b9-473a-aeca-3d1934e26a8f')
    expect(formData.get('name')).toBe('インクラインベンチプレス')
  })

  it('shows an action error', async () => {
    mocks.createExerciseAction.mockResolvedValue({
      success: false,
      error: { message: '種目を登録できませんでした' },
    })
    render(<ExerciseForm />)

    fireEvent.change(screen.getByLabelText('種目名'), { target: { value: 'ベンチプレス' } })
    fireEvent.click(screen.getByRole('button', { name: '種目を登録' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('種目を登録できませんでした')
  })
})
