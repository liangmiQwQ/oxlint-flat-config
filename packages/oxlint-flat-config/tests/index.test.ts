import { expect, it } from 'vite-plus/test'

import { defineConfig } from '../src/index.ts'

// TODO: test building global ignores, root fields and overrides
it('defineConfig', () => {
  expect(defineConfig()).toEqual({})
})

it('keeps a later unscoped rule after an earlier scoped one', () => {
  expect(
    defineConfig(
      { files: ['src/**'], rules: { 'no-console': 'error' } },
      { categories: { correctness: 'error' }, rules: { 'no-console': 'off' } }
    )
  ).toEqual({
    categories: { correctness: 'error' },
    overrides: [
      { files: ['src/**'], excludeFiles: [], rules: { 'no-console': 'error' } },
      { files: ['**/*'], excludeFiles: [], rules: { 'no-console': 'off' } }
    ]
  })
})
