import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import packageJson from '@/package.json'

const temporaryDirectories: string[] = []

function runCommitMessageHook(message: string) {
  const directory = mkdtempSync(path.join(tmpdir(), 'lift-dash-commitlint-'))
  const messagePath = path.join(directory, 'COMMIT_EDITMSG')

  temporaryDirectories.push(directory)
  writeFileSync(messagePath, `${message}\n`)

  return spawnSync('sh', ['.husky/commit-msg', messagePath], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('development toolchain alignment', () => {
  it('pins compatible Vite, Vitest, and TypeScript package versions', () => {
    expect(packageJson.devDependencies).toMatchObject({
      '@typescript/native': 'npm:typescript@7.0.2',
      '@vitejs/plugin-react': '6.0.4',
      '@vitest/coverage-v8': '4.1.10',
      typescript: '6.0.3',
      vite: '8.1.5',
      vitest: '4.1.10',
    })

    expect(packageJson.scripts['type-check']).toBe(
      'node node_modules/@typescript/native/bin/tsc --noEmit --incremental false'
    )

    const tsc = spawnSync(
      process.execPath,
      [path.resolve(process.cwd(), 'node_modules/@typescript/native/bin/tsc'), '--version'],
      { encoding: 'utf8' }
    )

    expect(tsc.status, tsc.stderr).toBe(0)
    expect(tsc.stdout.trim()).toBe('Version 7.0.2')
    const legacyTypeScript = spawnSync(
      process.execPath,
      ['-e', "console.log(require('typescript').version)"],
      { cwd: process.cwd(), encoding: 'utf8' }
    )

    expect(legacyTypeScript.status, legacyTypeScript.stderr).toBe(0)
    expect(legacyTypeScript.stdout.trim()).toBe('6.0.3')
  })

  it('pins the verified PostCSS release for development and transitive consumers', () => {
    expect(packageJson.devDependencies.postcss).toBe('8.5.26')
    expect(packageJson.overrides.postcss).toBe('8.5.26')

    const postcss = spawnSync(
      process.execPath,
      ['-e', "console.log(require('postcss/package.json').version)"],
      { cwd: process.cwd(), encoding: 'utf8' }
    )

    expect(postcss.status, postcss.stderr).toBe(0)
    expect(postcss.stdout.trim()).toBe('8.5.26')
  })

  it('keeps commitlint packages on the same release line', () => {
    expect(packageJson.devDependencies).toMatchObject({
      '@commitlint/cli': '21.2.1',
      '@commitlint/config-conventional': '21.2.0',
    })
  })

  it('keeps Node types on the supported major and ignores future major updates', () => {
    const dependabotConfig = readFileSync(
      path.resolve(process.cwd(), '.github/dependabot.yml'),
      'utf8'
    )
    const readme = readFileSync(path.resolve(process.cwd(), 'README.md'), 'utf8')

    expect(packageJson).toMatchObject({
      devDependencies: {
        '@types/node': '24.13.3',
        jsdom: '30.0.1',
      },
      engines: {
        node: '^22.22.2 || ^24.15.0 || >=26.0.0',
      },
    })
    expect(dependabotConfig).toMatch(
      /- dependency-name: ['"]?@types\/node['"]?\n\s+update-types:\n\s+- version-update:semver-major/
    )
    expect(readme).toContain('Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`')
  })

  it('keeps strict compiler checks and declares CSS side-effect imports explicitly', () => {
    const tsconfig = readFileSync(path.resolve(process.cwd(), 'tsconfig.json'), 'utf8')
    const globalDeclarationsPath = path.resolve(process.cwd(), 'global.d.ts')
    const globalDeclarations = existsSync(globalDeclarationsPath)
      ? readFileSync(globalDeclarationsPath, 'utf8')
      : ''

    expect(tsconfig).toMatch(/"strict": true/)
    expect(tsconfig).toMatch(/"noUncheckedIndexedAccess": true/)
    expect(tsconfig).toMatch(/"noImplicitReturns": true/)
    expect(tsconfig).toMatch(/"noFallthroughCasesInSwitch": true/)
    expect(tsconfig).toMatch(/"exactOptionalPropertyTypes": true/)
    expect(tsconfig).not.toMatch(/"noUncheckedSideEffectImports": false/)
    expect(globalDeclarations).toMatch(/declare module ['"]\*\.css['"]/)
  })
})

describe('commit message hook', () => {
  it('accepts a valid project commit message', () => {
    const result = runCommitMessageHook('chore(deps): align development toolchain (#50)')

    expect(result.status, result.stderr).toBe(0)
  })

  it('rejects a scope outside the project scope list', () => {
    const result = runCommitMessageHook('chore(unknown): bypass project scopes (#50)')

    expect(result.status).toBe(1)
    expect(result.stdout + result.stderr).toContain(
      'scope must be one of [auth, exercise, preset, workout, dashboard, log, db, ci, deps]'
    )
  })
})
