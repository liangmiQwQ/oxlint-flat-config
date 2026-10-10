import { defineConfig } from 'oxlint-flat-config'
import type { ConfigInput } from 'oxlint-flat-config'
import { expect, it } from 'vite-plus/test'

import { composer } from '../src/index.ts'

it('resolves to the same config as defineConfig', async () => {
  const configs: ConfigInput[] = [
    { categories: { correctness: 'error' } },
    { files: ['src/**'], rules: { 'no-console': 'error' } }
  ]

  expect(await composer(...configs)).toEqual(defineConfig(...configs))
})

it('awaits async inputs in order', async () => {
  const config = await composer(
    Promise.resolve({ files: ['a/**'], rules: { 'no-console': 'error' } }),
    [{ files: ['b/**'], rules: { 'no-console': 'off' } }]
  )

  expect(config.overrides?.map(override => override.files)).toEqual([['a/**'], ['b/**']])
})

it('rejects when an input rejects', async () => {
  const input = Promise.reject(new Error('boom'))

  await expect(composer(input)).rejects.toThrow('boom')
})
