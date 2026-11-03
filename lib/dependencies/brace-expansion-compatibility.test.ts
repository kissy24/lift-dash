import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

const projectRequire = createRequire(import.meta.url)

describe('glob dependency compatibility patches', () => {
  it('keeps callable CommonJS exports used by legacy glob consumers', () => {
    const braceExpand: unknown = projectRequire('brace-expansion')
    const minimatch: unknown = projectRequire('minimatch')

    expect(typeof braceExpand).toBe('function')
    expect(typeof minimatch).toBe('function')

    if (typeof braceExpand !== 'function' || typeof minimatch !== 'function') {
      throw new Error('Expected callable CommonJS exports')
    }

    expect(braceExpand('ci-{a,b}')).toEqual(['ci-a', 'ci-b'])
    expect(minimatch('ci-a', 'ci-{a,b}')).toBe(true)
  })

  it('keeps the default export used by minimatch 9', async () => {
    const braceExpansion = await import('brace-expansion')

    expect(typeof braceExpansion.default).toBe('function')
    expect(braceExpansion.default('ci-{a,b}')).toEqual(['ci-a', 'ci-b'])
  })

  it('retains the named ESM export used by minimatch 10', async () => {
    const braceExpansion = await import('brace-expansion')

    expect(braceExpansion.expand('ci-{a,b}')).toEqual(['ci-a', 'ci-b'])
  })
})
