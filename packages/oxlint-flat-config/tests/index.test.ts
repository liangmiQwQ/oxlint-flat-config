import type { OxlintConfig } from 'oxlint'
import { expect, expectTypeOf, it } from 'vite-plus/test'

import type {
  ConfigInput,
  FlatConfigItem,
  GlobalConfigItem,
  GlobalIgnoresItem,
  ScopedConfigItem
} from '../src/index.ts'
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
  expectTypeOf<GlobalIgnoresItem>().toExtend<ConfigInput>()
})

it('FlatConfigItem is discriminated by `files`', () => {
  expectTypeOf<FlatConfigItem>().toEqualTypeOf<GlobalConfigItem | ScopedConfigItem>()

  expectTypeOf({ rules: {}, categories: {} }).toExtend<GlobalConfigItem>()
  expectTypeOf({ files: ['*.ts'], rules: {} }).toExtend<ScopedConfigItem>()

  // Root-only oxlint fields are not allowed once `files` is set.
  expectTypeOf({ files: ['*.ts'], categories: {} }).not.toExtend<FlatConfigItem>()
  expectTypeOf({ files: ['*.ts'], settings: {} }).not.toExtend<FlatConfigItem>()
  expectTypeOf({ files: ['*.ts'], options: {} }).not.toExtend<FlatConfigItem>()
})
