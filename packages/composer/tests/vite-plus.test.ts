import { defineConfig } from 'oxlint-flat-config/vite-plus'
import { expect, it } from 'vite-plus/test'

import { composer } from '../src/vite-plus.ts'

it('runs steps on the lint block and keeps other Vite+ fields', async () => {
  const preset = [
    { name: 'preset/base', rules: { 'no-console': 'error' as const } },
    { name: 'preset/stylistic', rules: { curly: 'error' as const } }
  ]

  const config = await composer({ fmt: { semi: false }, lint: Promise.resolve(preset) })
    .override('preset/base', { rules: { 'no-console': 'warn' } })
    .remove('preset/stylistic')

  expect(config).toMatchObject({
    fmt: { semi: false },
    lint: defineConfig({ lint: { name: 'preset/base', rules: { 'no-console': 'warn' } } }).lint
  })
})
