export type AuthDestination = '/login' | '/mfa/enroll' | '/mfa/verify' | '/dashboard'

type AuthenticatorAssuranceLevel = 'aal1' | 'aal2' | null

type AuthState = {
  isAuthenticated: boolean
  currentLevel: AuthenticatorAssuranceLevel
  hasVerifiedTotp: boolean
}

const AUTH_PATHS: ReadonlySet<string> = new Set(['/login', '/mfa/enroll', '/mfa/verify'])

export function getAuthDestination({
  isAuthenticated,
  currentLevel,
  hasVerifiedTotp,
}: AuthState): AuthDestination {
  if (!isAuthenticated) return '/login'
  if (!hasVerifiedTotp) return '/mfa/enroll'
  if (currentLevel !== 'aal2') return '/mfa/verify'
  return '/dashboard'
}

export function shouldRedirectToAuthDestination(
  pathname: string,
  destination: AuthDestination
): boolean {
  if (destination !== '/dashboard') return pathname !== destination
  return pathname === '/' || AUTH_PATHS.has(pathname)
}
