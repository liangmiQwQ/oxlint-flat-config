import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import type { OxlintConfig } from 'oxlint'
import { expect, it } from 'vite-plus/test'

import { defineConfig } from '../src/index.ts'

const oxlintBin = path.join(
  path.dirname(createRequire(import.meta.url).resolve('oxlint/package.json')),
  'bin/oxlint'
)

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

it('enables the plugins used by rules in the root config', () => {
  const config = defineConfig(
    { rules: { 'no-console': 'error', 'unicorn/no-null': 'error' } },
    { files: ['**/*.tsx'], rules: { 'react/jsx-key': 'error', 'unicorn/no-null': 'off' } }
  )

  expect(config.plugins).toEqual(['eslint', 'react', 'unicorn'])
  expect(config.overrides).toEqual([
    expect.not.objectContaining({ plugins: expect.anything() }),
    expect.not.objectContaining({ plugins: expect.anything() })
  ])
})

it('understands the rule prefixes Oxlint accepts for its plugins', () => {
  const config = defineConfig({
    rules: {
      'eslint/no-debugger': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'import-x/no-cycle': 'error',
      '@next/next/no-img-element': 'error',
      'deepscan/bad-array-method-on-arguments': 'error',
      'jsx_a11y/alt-text': 'error',
      'eslint-plugin-unicorn/no-null': 'error'
    }
  })

  expect(config.plugins).toEqual([
    'eslint',
    'import',
    'jsx-a11y',
    'nextjs',
    'oxc',
    'react',
    'typescript',
    'unicorn'
  ])
})

it('leaves rules of JS plugins to `jsPlugins`', () => {
  expect(defineConfig({ rules: { 'my-plugin/some-rule': 'error' } }).plugins).toEqual([])
})

it('ignores `plugins` in config objects', () => {
  const config = defineConfig({
    // @ts-expect-error -- plugins are enabled from rules
    plugins: ['vue'],
    rules: { 'no-console': 'error' }
  })

  expect(config.plugins).toEqual(['eslint'])
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

it('runs `import` rules that read other files', () => {
  const files = {
    'a.ts': "import { b } from './b.ts'\nexport const a = b\n",
    'b.ts': "import { a } from './a.ts'\nexport const b = () => a\n"
  }

  expect(
    lint(defineConfig({ files: ['**/*.ts'], rules: { 'import/no-cycle': 'error' } }), files)
  ).toEqual(['import(no-cycle)'])
})
