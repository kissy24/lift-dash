import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { getAuthDestination, shouldRedirectToAuthDestination } from '@/lib/auth/route-guard'

import { getSupabaseConfig } from './config'
import type { Database } from './database.types'

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })
  const { url, anonKey } = getSupabaseConfig()
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentLevel: 'aal1' | 'aal2' | null = null
  let hasVerifiedTotp = false

  if (user) {
    const [assurance, factors] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ])
    currentLevel = assurance.data?.currentLevel ?? null
    hasVerifiedTotp = (factors.data?.totp.length ?? 0) > 0
  }

  const destination = getAuthDestination({
    isAuthenticated: Boolean(user),
    currentLevel,
    hasVerifiedTotp,
  })

  if (!shouldRedirectToAuthDestination(request.nextUrl.pathname, destination)) return response

  const redirectResponse = NextResponse.redirect(new URL(destination, request.url))
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
  return redirectResponse
}
