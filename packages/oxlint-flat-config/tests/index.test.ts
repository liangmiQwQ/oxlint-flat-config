import { expect, it } from 'vite-plus/test'

import { defineConfig } from '../src/index.ts'

it('defineConfig', () => {
  expect(() => {
    defineConfig()
  }).toThrow('Not implemented yet')
})
