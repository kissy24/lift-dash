import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  verifyTotpChallengeAction: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/lib/actions/auth', () => ({
  verifyTotpChallengeAction: mocks.verifyTotpChallengeAction,
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))

import { MfaChallengeForm } from './MfaChallengeForm'

describe('MfaChallengeForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('verifies the code and enters the dashboard', async () => {
    mocks.verifyTotpChallengeAction.mockResolvedValue({
      success: true,
      data: { redirectTo: '/dashboard' },
    })
    render(<MfaChallengeForm />)

    fireEvent.change(screen.getByLabelText('6桁の認証コード'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: '認証する' }))

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/dashboard'))
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })
})
