import type { OxlintConfig } from 'oxlint'
import { expect, expectTypeOf, it } from 'vite-plus/test'

import type { ConfigInput, FlatConfigItem } from '../src/index.ts'
import { defineConfig } from '../src/index.ts'

it('defineConfig', () => {
  expect(() => {
    defineConfig()
  }).toThrow('Not implemented yet')
})

it('defineConfig accepts flat config items, nested arrays and falsy values', () => {
  expectTypeOf(defineConfig).parameters.toEqualTypeOf<ConfigInput[]>()
  expectTypeOf(defineConfig).returns.toEqualTypeOf<OxlintConfig>()

  expectTypeOf<FlatConfigItem>().toExtend<ConfigInput>()
  expectTypeOf<FlatConfigItem[]>().toExtend<ConfigInput>()
  expectTypeOf<false | null | undefined>().toExtend<ConfigInput>()
})

it('FlatConfigItem carries ESLint-style fields next to oxlint override fields', () => {
  expectTypeOf<FlatConfigItem>().toHaveProperty('name')
  expectTypeOf<FlatConfigItem>().toHaveProperty('files')
  expectTypeOf<FlatConfigItem>().toHaveProperty('ignores')
  expectTypeOf<FlatConfigItem>().toHaveProperty('rules')
  expectTypeOf<FlatConfigItem>().toHaveProperty('categories')
  expectTypeOf<FlatConfigItem>().not.toHaveProperty('excludeFiles')
})
