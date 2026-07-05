import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  order: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('@/lib/actions/preset', () => ({ deletePresetAction: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

import PresetsPage from './page'

describe('PresetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockReturnValue({ select: mocks.select })
    mocks.select.mockReturnValue({ order: mocks.order })
  })

  it('renders preset summaries', async () => {
    mocks.order.mockResolvedValue({
      data: [
        {
          id: '15d7ac4f-e9b1-48a0-a2b1-a589b893b634',
          name: '胸の日',
          preset_items: [{ id: 'item-1' }, { id: 'item-2' }],
        },
      ],
      error: null,
    })

    render(await PresetsPage())

    expect(screen.getByRole('heading', { level: 1, name: 'プリセット' })).toBeInTheDocument()
    expect(screen.getByText('胸の日')).toBeInTheDocument()
    expect(screen.getByText('2種目')).toBeInTheDocument()
  })

  it('renders an empty state', async () => {
    mocks.order.mockResolvedValue({ data: [], error: null })
    render(await PresetsPage())
    expect(screen.getByText('プリセットがありません')).toBeInTheDocument()
  })
})
