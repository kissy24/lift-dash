import { describe, expect, it } from 'vitest'

import { getAuthDestination, shouldRedirectToAuthDestination } from './route-guard'

describe('getAuthDestination', () => {
  it('sends signed-out visitors to login', () => {
    expect(
      getAuthDestination({ isAuthenticated: false, currentLevel: null, hasVerifiedTotp: false })
    ).toBe('/login')
  })

  it('requires enrollment when no verified TOTP factor exists', () => {
    expect(
      getAuthDestination({ isAuthenticated: true, currentLevel: 'aal1', hasVerifiedTotp: false })
    ).toBe('/mfa/enroll')
  })

  it('requires a challenge for an enrolled aal1 session', () => {
    expect(
      getAuthDestination({ isAuthenticated: true, currentLevel: 'aal1', hasVerifiedTotp: true })
    ).toBe('/mfa/verify')
  })

  it('allows an aal2 session into the dashboard', () => {
    expect(
      getAuthDestination({ isAuthenticated: true, currentLevel: 'aal2', hasVerifiedTotp: true })
    ).toBe('/dashboard')
  })
})

describe('shouldRedirectToAuthDestination', () => {
  it('allows an aal2 session to remain on a protected page', () => {
    expect(shouldRedirectToAuthDestination('/exercises', '/dashboard')).toBe(false)
  })

  it('redirects an aal2 session away from authentication pages', () => {
    expect(shouldRedirectToAuthDestination('/login', '/dashboard')).toBe(true)
  })

  it('allows a user to remain on the required MFA page', () => {
    expect(shouldRedirectToAuthDestination('/mfa/verify', '/mfa/verify')).toBe(false)
  })

  it('redirects users who have not completed MFA away from protected pages', () => {
    expect(shouldRedirectToAuthDestination('/dashboard', '/mfa/verify')).toBe(true)
  })
})
