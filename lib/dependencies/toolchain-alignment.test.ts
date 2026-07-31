import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
  it('pins compatible Vite and Vitest package versions', () => {
    expect(packageJson.devDependencies).toMatchObject({
      '@vitejs/plugin-react': '6.0.3',
      '@vitest/coverage-v8': '4.1.10',
      vite: '8.1.5',
      vitest: '4.1.10',
    })
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

    expect(packageJson.devDependencies['@types/node']).toBe('24.13.3')
    expect(dependabotConfig).toMatch(
      /- dependency-name: ['"]?@types\/node['"]?\n\s+update-types:\n\s+- version-update:semver-major/
    )
    expect(readme).toContain('Node.js 22.12.0以上')
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
