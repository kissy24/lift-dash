import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  order: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('@/lib/actions/preset', () => ({
  createPresetAction: vi.fn(),
  updatePresetAction: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import NewPresetPage from './page'

describe('NewPresetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({ from: mocks.from })
    mocks.from.mockReturnValue({ select: mocks.select })
    mocks.select.mockReturnValue({ order: mocks.order })
  })

  it('loads exercises and renders the form', async () => {
    mocks.order.mockResolvedValue({
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
    render(await NewPresetPage())
    expect(screen.getByRole('heading', { name: 'プリセットを作成' })).toBeInTheDocument()
    expect(screen.getByLabelText('種目')).toHaveValue('5f768f8b-91b9-473a-aeca-3d1934e26a8f')
  })
})
