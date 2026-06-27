import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  loginAction: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/lib/actions/auth', () => ({ loginAction: mocks.loginAction }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))

import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('submits credentials and follows the returned MFA destination', async () => {
    mocks.loginAction.mockResolvedValue({
      success: true,
      data: { redirectTo: '/mfa/verify' },
    })
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'owner@example.com' },
    })
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/mfa/verify'))
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })

  it('shows an authentication error', async () => {
    mocks.loginAction.mockResolvedValue({
      success: false,
      error: { message: 'メールアドレスまたはパスワードが正しくありません' },
    })
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'owner@example.com' },
    })
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'wrong-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(
      await screen.findByText('メールアドレスまたはパスワードが正しくありません')
    ).toBeInTheDocument()
  })
})
