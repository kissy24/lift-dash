import { describe, expect, it } from 'vitest'

import { loginSchema, totpCodeSchema } from './auth'

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(
      loginSchema.safeParse({ email: 'owner@example.com', password: 'correct-horse-battery' })
        .success
    ).toBe(true)
  })

  it('rejects an invalid email and an empty password', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined()
      expect(result.error.flatten().fieldErrors.password).toBeDefined()
    }
  })
})

describe('totpCodeSchema', () => {
  it('accepts a six-digit TOTP code', () => {
    expect(totpCodeSchema.safeParse({ code: '012345' }).success).toBe(true)
  })

  it.each(['12345', '1234567', 'abcdef'])('rejects invalid code %s', (code) => {
    expect(totpCodeSchema.safeParse({ code }).success).toBe(false)
  })
})
