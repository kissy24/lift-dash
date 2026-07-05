import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  deletePresetAction: vi.fn(),
  refresh: vi.fn(),
  confirm: vi.fn(),
}))

vi.mock('@/lib/actions/preset', () => ({ deletePresetAction: mocks.deletePresetAction }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mocks.refresh }) }))

import { PresetList } from './PresetList'

describe('PresetList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.confirm.mockReturnValue(true)
    vi.stubGlobal('confirm', mocks.confirm)
  })

  it('links to edit and deletes after confirmation', async () => {
    mocks.deletePresetAction.mockResolvedValue({ success: true, data: undefined })
    render(
      <PresetList
        presets={[
          {
            id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634',
            name: '胸の日',
            itemCount: 2,
          },
        ]}
      />
    )

    expect(screen.getByRole('link', { name: '胸の日' })).toHaveAttribute(
      'href',
      '/presets/15d7ac4f-e9b1-48a0-a2b1-a589b893b634'
    )
    expect(screen.getByText('2種目')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '胸の日を削除' }))

    await waitFor(() => expect(mocks.deletePresetAction).toHaveBeenCalledOnce())
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })
})
