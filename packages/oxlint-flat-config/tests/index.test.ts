import { expect, it } from 'vite-plus/test'

import { defineConfig } from '../src/index.ts'

// TODO: test building global ignores, root fields and overrides
it('defineConfig', () => {
  expect(defineConfig()).toEqual({})
})
