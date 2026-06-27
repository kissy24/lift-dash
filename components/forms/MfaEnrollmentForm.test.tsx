import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  startTotpEnrollmentAction: vi.fn(),
  verifyTotpEnrollmentAction: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/lib/actions/auth', () => ({
  startTotpEnrollmentAction: mocks.startTotpEnrollmentAction,
  verifyTotpEnrollmentAction: mocks.verifyTotpEnrollmentAction,
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))

import { MfaEnrollmentForm } from './MfaEnrollmentForm'

describe('MfaEnrollmentForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows enrollment data and verifies the TOTP code', async () => {
    mocks.startTotpEnrollmentAction.mockResolvedValue({
      success: true,
      data: {
        factorId: 'factor-1',
        qrCode: 'data:image/svg+xml;base64,abc',
        secret: 'SECRET',
      },
    })
    mocks.verifyTotpEnrollmentAction.mockResolvedValue({
      success: true,
      data: { redirectTo: '/dashboard' },
    })
    render(<MfaEnrollmentForm />)

    fireEvent.click(screen.getByRole('button', { name: 'MFAを設定する' }))

    expect(await screen.findByAltText('認証アプリ登録用QRコード')).toBeInTheDocument()
    expect(screen.getByText('SECRET')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('6桁の認証コード'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'MFAを有効にする' }))

    await waitFor(() => expect(mocks.verifyTotpEnrollmentAction).toHaveBeenCalledOnce())
    const formData = mocks.verifyTotpEnrollmentAction.mock.calls[0]?.[0]
    expect(formData).toBeInstanceOf(FormData)
    if (!(formData instanceof FormData)) throw new Error('Expected FormData')
    expect(formData.get('factorId')).toBe('factor-1')
    expect(formData.get('code')).toBe('123456')
    expect(mocks.replace).toHaveBeenCalledWith('/dashboard')
  })
})
