import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  logoutAction: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/lib/actions/auth', () => ({ logoutAction: mocks.logoutAction }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))

import { LogoutButton } from './LogoutButton'

describe('LogoutButton', () => {
  beforeEach(() => vi.clearAllMocks())

  it('ends the session and returns to login', async () => {
    mocks.logoutAction.mockResolvedValue({
      success: true,
      data: { redirectTo: '/login' },
    })
    render(<LogoutButton />)

    fireEvent.click(screen.getByRole('button', { name: 'ログアウト' }))

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/login'))
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })
})
