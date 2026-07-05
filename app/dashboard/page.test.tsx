import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/forms/LogoutButton', () => ({
  LogoutButton: () => <button type="button">ログアウト</button>,
}))

import DashboardPage from './page'

describe('DashboardPage', () => {
  it('links to the manual workout entry page', () => {
    render(<DashboardPage />)

    expect(screen.getByRole('link', { name: '記録を追加' })).toHaveAttribute('href', '/log/new')
    expect(screen.getByRole('link', { name: '記録一覧' })).toHaveAttribute('href', '/log')
    expect(screen.getByRole('link', { name: 'プリセット' })).toHaveAttribute('href', '/presets')
  })
})
