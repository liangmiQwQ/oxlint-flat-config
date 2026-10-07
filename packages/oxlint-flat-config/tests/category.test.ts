import { expect, it } from 'vite-plus/test'

import { category } from '../src/index.ts'

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
