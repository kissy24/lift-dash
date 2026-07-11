import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: mocks.push }),
}))

import { DashboardFilters } from './DashboardFilters'

describe('DashboardFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders every range and exercise option', () => {
    render(
      <DashboardFilters
        exercises={[
          { id: 'bench', name: 'ベンチプレス' },
          { id: 'squat', name: 'スクワット' },
        ]}
        filters={{ range: '30d', exerciseId: null }}
      />
    )

    expect(screen.getByRole('option', { name: '直近30日' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '90日' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '180日' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '1年' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '全期間' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '全種目' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'ベンチプレス' })).toBeInTheDocument()
  })

  it('writes range changes to the dashboard query', () => {
    render(<DashboardFilters exercises={[]} filters={{ range: '30d', exerciseId: null }} />)

    fireEvent.change(screen.getByRole('combobox', { name: '期間' }), {
      target: { value: '90d' },
    })

    expect(mocks.push).toHaveBeenCalledWith('/dashboard?range=90d')
  })

  it('preserves the range when selecting an exercise', () => {
    render(
      <DashboardFilters
        exercises={[{ id: 'bench', name: 'ベンチプレス' }]}
        filters={{ range: '90d', exerciseId: null }}
      />
    )

    fireEvent.change(screen.getByRole('combobox', { name: '種目' }), {
      target: { value: 'bench' },
    })

    expect(mocks.push).toHaveBeenCalledWith('/dashboard?range=90d&exercise=bench')
  })
})
