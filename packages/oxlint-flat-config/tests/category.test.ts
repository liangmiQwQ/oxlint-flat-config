import { expect, it } from 'vite-plus/test'

import { category, defineConfig } from '../src/index.ts'

it('expands categories into explicit rules with their own severity', async () => {
  const config = await category(
    { correctness: 'error', perf: 'warn' },
    { files: ['src/**'], ignores: ['src/legacy/**'] }
  )

  expect(config).toMatchObject({
    name: 'category correctness, perf',
    files: ['src/**'],
    ignores: ['src/legacy/**'],
    rules: {
      'eslint/no-debugger': 'error',
      'jsx-a11y/alt-text': 'error',
      'react-perf/jsx-no-new-object-as-prop': 'warn'
    }
  })
  expect(config.rules).not.toHaveProperty('eslint/curly')
})

it('applies to every file when no `files` is given', async () => {
  const config = await category({ style: 'off' }, { name: 'no style' })

  expect(config).not.toHaveProperty('files')
  expect(config).toMatchObject({ name: 'no style', rules: { 'eslint/curly': 'off' } })
})

it('becomes root categories when no rules come before it', async () => {
  const config = defineConfig(
    { plugins: ['typescript'] },
    await category({ correctness: 'warn', perf: 'warn' }),
    await category({ correctness: 'error' })
  )

  expect(config.categories).toEqual({ correctness: 'error', perf: 'warn' })
  expect(config.overrides).toEqual([{ files: ['**/*'], excludeFiles: [], plugins: ['typescript'] }])
})

it('stays explicit after rules, when scoped or when its rules are edited', async () => {
  const preset = await category({ correctness: 'error' })
  const scoped = await category({ correctness: 'error' }, { files: ['src/**'] })

  expect(defineConfig({ rules: { 'no-debugger': 'off' } }, preset).categories).toBeUndefined()
  expect(defineConfig(scoped).categories).toBeUndefined()
  expect(defineConfig({ ...preset, rules: { ...preset.rules } }).categories).toBeUndefined()
})
