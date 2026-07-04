import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Exercise } from '@/lib/supabase/database.types'

const mocks = vi.hoisted(() => ({
  deleteExerciseAction: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/lib/actions/exercise', () => ({
  deleteExerciseAction: mocks.deleteExerciseAction,
  updateExerciseAction: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mocks.refresh }) }))

import { ExerciseList } from './ExerciseList'

const exercise: Exercise = {
  id: '5f768f8b-91b9-473a-aeca-3d1934e26a8f',
  name: 'ベンチプレス',
  muscle_group: 'chest',
  created_at: '2026-06-27T00:00:00Z',
  updated_at: '2026-06-27T00:00:00Z',
}

describe('ExerciseList', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the exercise and its muscle group label', () => {
    render(<ExerciseList exercises={[exercise]} />)

    expect(screen.getByText('ベンチプレス')).toBeInTheDocument()
    expect(screen.getAllByText('胸')).not.toHaveLength(0)
  })

  it('deletes an exercise after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mocks.deleteExerciseAction.mockResolvedValue({ success: true, data: undefined })
    render(<ExerciseList exercises={[exercise]} />)

    fireEvent.click(screen.getByRole('button', { name: 'ベンチプレスを削除' }))

    await waitFor(() => expect(mocks.deleteExerciseAction).toHaveBeenCalledOnce())
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })

  it('does not delete when confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ExerciseList exercises={[exercise]} />)

    fireEvent.click(screen.getByRole('button', { name: 'ベンチプレスを削除' }))

    expect(mocks.deleteExerciseAction).not.toHaveBeenCalled()
  })

  it('shows a delete error', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mocks.deleteExerciseAction.mockResolvedValue({
      success: false,
      error: { message: '種目を削除できませんでした' },
    })
    render(<ExerciseList exercises={[exercise]} />)

    fireEvent.click(screen.getByRole('button', { name: 'ベンチプレスを削除' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('種目を削除できませんでした')
  })

  it('shows an empty state', () => {
    render(<ExerciseList exercises={[]} />)

    expect(screen.getByText('登録済みの種目はありません')).toBeInTheDocument()
  })
})
