import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import type { OxlintConfig } from 'oxlint'
import { expect, it } from 'vite-plus/test'

import { defineConfig, recommended } from '../src/index.ts'

const oxlintDir = path.dirname(createRequire(import.meta.url).resolve('oxlint/package.json'))
const oxlintBin = path.join(oxlintDir, 'bin/oxlint')

/** Lints the files with the config and returns the rules Oxlint reports, like `react(jsx-key)`. */
function lint(config: OxlintConfig, files: Record<string, string>): string[] {
  const dir = mkdtempSync(path.join(tmpdir(), 'oxlint-flat-config-'))
  try {
    writeFileSync(path.join(dir, '.oxlintrc.json'), JSON.stringify(config))
    for (const [name, code] of Object.entries(files)) {
      writeFileSync(path.join(dir, name), code)
    }

    const { stdout } = spawnSync(
      process.execPath,
      [oxlintBin, '-c', '.oxlintrc.json', '-f', 'json'],
      { cwd: dir, encoding: 'utf8' }
    )
    const { diagnostics } = JSON.parse(stdout) as { diagnostics: { code: string }[] }
    return [...new Set(diagnostics.map(diagnostic => diagnostic.code))].toSorted()
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

it('enables every built-in plugin in the root, ignoring `plugins` in config objects', () => {
  const schema = JSON.parse(readFileSync(path.join(oxlintDir, 'configuration_schema.json'), 'utf8'))
  const config = defineConfig({
    // @ts-expect-error -- every built-in plugin is enabled
    plugins: ['vue'],
    rules: { 'no-console': 'error' }
  })

  expect(config.plugins?.toSorted()).toEqual(
    schema.definitions.LintPluginOptionsSchema.enum.toSorted()
  )
  expect(config.overrides?.[0]).not.toHaveProperty('plugins')
})

it('turns off a rule in a later config object', () => {
  const files = { 'list.tsx': 'export const list = [1].map(i => <div>{i}</div>)\n' }
  const enabled = { rules: { 'react/jsx-key': 'error' } } as const

  expect(lint(defineConfig(enabled), files)).toEqual(['react(jsx-key)'])
  expect(
    lint(defineConfig(enabled, { files: ['**/*.tsx'], rules: { 'react/jsx-key': 'off' } }), files)
  ).toEqual([])
})

it('runs recommended rules and lets later config objects disable them', () => {
  const files = { 'a.js': 'debugger;\n' }

  expect(lint(defineConfig(recommended), files)).toEqual(['eslint(no-debugger)'])
  expect(
    lint(defineConfig(recommended, { rules: { 'eslint/no-debugger': 'off' } }), files)
  ).toEqual([])
})

it('runs `import` rules that read other files', () => {
  const files = {
    'a.ts': "import { b } from './b.ts'\nexport const a = b\n",
    'b.ts': "import { a } from './a.ts'\nexport const b = () => a\n"
  }

  expect(
    lint(defineConfig({ files: ['**/*.ts'], rules: { 'import/no-cycle': 'error' } }), files)
  ).toEqual(['import(no-cycle)'])
})

it('runs an unprefixed rule of a plugin other than ESLint', () => {
  const files = { 'a.ts': 'export default 1\n' }

  expect(lint(defineConfig({ rules: { 'no-default-export': 'error' } }), files)).toEqual([
    'import(no-default-export)'
  ])
})

it('runs an unprefixed rule shared by Jest and Vitest in a Vitest test file', () => {
  const files = { 'a.test.ts': "import { it } from 'vitest'\nit.skip('a', () => {})\n" }

  expect(lint(defineConfig({ rules: { 'no-disabled-tests': 'error' } }), files)).toEqual([
    'jest(no-disabled-tests)'
  ])
})
