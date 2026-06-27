import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ redirect: vi.fn() }))

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import HomePage from './page'

describe('HomePage', () => {
  it('redirects to the authenticated landing page', () => {
    HomePage()

    expect(mocks.redirect).toHaveBeenCalledWith('/dashboard')
  })
})
