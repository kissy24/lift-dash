import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createPresetAction: vi.fn(),
  updatePresetAction: vi.fn(),
  push: vi.fn(),
}))

vi.mock('@/lib/actions/preset', () => ({
  createPresetAction: mocks.createPresetAction,
  updatePresetAction: mocks.updatePresetAction,
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))

import { PresetForm } from './PresetForm'

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

describe('PresetForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds unique exercises and changes their display order', () => {
    render(<PresetForm exercises={EXERCISES} />)

    fireEvent.click(screen.getByRole('button', { name: '種目を追加' }))
    expect(screen.getAllByLabelText('種目')).toHaveLength(2)
    expect(screen.getAllByLabelText('種目')[0]).toHaveValue(EXERCISES[0]?.id)
    expect(screen.getAllByLabelText('種目')[1]).toHaveValue(EXERCISES[1]?.id)

    fireEvent.click(screen.getAllByRole('button', { name: '上へ移動' })[1]!)
    expect(screen.getAllByLabelText('種目')[0]).toHaveValue(EXERCISES[1]?.id)
  })

  it('creates a preset with nullable defaults', async () => {
    mocks.createPresetAction.mockResolvedValue({
      success: true,
      data: { id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634' },
    })
    render(<PresetForm exercises={EXERCISES} />)

    fireEvent.change(screen.getByLabelText('プリセット名'), { target: { value: '胸の日' } })
    fireEvent.change(screen.getByLabelText('デフォルト重量（kg）'), {
      target: { value: '60.5' },
    })
    fireEvent.change(screen.getByLabelText('デフォルトレップ数'), {
      target: { value: '10' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'プリセットを登録' }))

    await waitFor(() => expect(mocks.createPresetAction).toHaveBeenCalledOnce())
    const formData = mocks.createPresetAction.mock.calls[0]?.[0]
    expect(formData).toBeInstanceOf(FormData)
    if (!(formData instanceof FormData)) throw new Error('Expected FormData')
    expect(JSON.parse(String(formData.get('payload')))).toEqual({
      name: '胸の日',
      items: [
        {
          exerciseId: EXERCISES[0]?.id,
          defaultWeight: 60.5,
          defaultReps: 10,
          defaultSets: 3,
        },
      ],
    })
    expect(mocks.push).toHaveBeenCalledWith('/presets/15d7ac4f-e9b1-48a0-a2b1-a589b893b634')
  })

  it('loads and updates an existing preset', async () => {
    mocks.updatePresetAction.mockResolvedValue({
      success: true,
      data: { id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634' },
    })
    render(
      <PresetForm
        exercises={EXERCISES}
        initialPreset={{
          id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634',
          name: '脚の日',
          items: [
            {
              exerciseId: EXERCISES[1]?.id ?? '',
              defaultWeight: 100,
              defaultReps: 5,
              defaultSets: 5,
            },
          ],
        }}
      />
    )

    expect(screen.getByLabelText('プリセット名')).toHaveValue('脚の日')
    expect(screen.getByLabelText('種目')).toHaveValue(EXERCISES[1]?.id)
    fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

    await waitFor(() => expect(mocks.updatePresetAction).toHaveBeenCalledOnce())
  })

  it('shows a safe action error', async () => {
    mocks.createPresetAction.mockResolvedValue({
      success: false,
      error: { message: 'プリセットを登録できませんでした' },
    })
    render(<PresetForm exercises={EXERCISES} />)
    fireEvent.change(screen.getByLabelText('プリセット名'), { target: { value: '胸の日' } })
    fireEvent.click(screen.getByRole('button', { name: 'プリセットを登録' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('プリセットを登録できませんでした')
  })
})
