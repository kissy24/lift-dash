import { spawnSync } from 'node:child_process'

import { Dumbbell } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import packageJson from '@/package.json'

describe('lucide-react compatibility', () => {
  it('pins the verified major release in the manifest and runtime', () => {
    expect(packageJson.dependencies['lucide-react']).toBe('1.31.0')

    const lucide = spawnSync(
      process.execPath,
      ['-e', "console.log(require('lucide-react/package.json').version)"],
      { cwd: process.cwd(), encoding: 'utf8' }
    )

    expect(lucide.status, lucide.stderr).toBe(0)
    expect(lucide.stdout.trim()).toBe('1.31.0')
  })

  it('imports and renders an icon with React 18', () => {
    const markup = renderToStaticMarkup(<Dumbbell aria-label="Workout" />)

    expect(markup).toContain('<svg')
    expect(markup).toContain('aria-label="Workout"')
    expect(markup).toContain('lucide-dumbbell')
  })
})
