import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

const projectRequire = createRequire(import.meta.url)

describe('brace-expansion compatibility patch', () => {
  it('keeps the callable CommonJS export used by minimatch 3', () => {
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

  it('keeps the default export used by minimatch 9', () => {
    const globRequire = createRequire(projectRequire.resolve('glob/package.json'))
    const minimatchModule: unknown = globRequire('minimatch')

    expect(minimatchModule).toHaveProperty('minimatch')

    if (
      typeof minimatchModule !== 'object' ||
      minimatchModule === null ||
      !('minimatch' in minimatchModule) ||
      typeof minimatchModule.minimatch !== 'function'
    ) {
      throw new Error('Expected minimatch 9 module export')
    }

    expect(minimatchModule.minimatch('ci-b', 'ci-{a,b}')).toBe(true)
  })

  it('retains the named ESM export used by minimatch 10', async () => {
    const braceExpansion = await import('brace-expansion')

    expect(braceExpansion.expand('ci-{a,b}')).toEqual(['ci-a', 'ci-b'])
  })
})
