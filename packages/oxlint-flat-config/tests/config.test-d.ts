import { it } from 'vite-plus/test'

import { category, defineConfig, globalIgnores, includeIgnoreFile } from '../src/index.ts'
import type {
  ExtendsItem,
  FlatConfigItem,
  GlobalIgnoresItem,
  ScopedConfigItem
} from '../src/index.ts'
import { defineConfig as defineViteConfig } from '../src/vite-plus.ts'

it('accepts configs, nested arrays and falsy entries', () => {
  const configs = [
    {},
    { rules: { 'no-console': 'warn' }, ignores: ['generated/**'] },
    { settings: {}, options: {} },
    { files: ['src/**'], rules: { 'no-console': 'error' } },
    { basePath: 'packages/a', rules: { 'no-console': 'error' } },
    { files: ['*.ts'], basePath: 'packages/a' },
    { basePath: 'packages/a', ignores: ['dist'] }
  ] satisfies FlatConfigItem[]
  defineConfig(configs, [false, null, undefined, [configs]])
})

it('rejects root-only fields with scope or ignores', () => {
  const scopedOptions = { files: ['src/**'], options: {} }
  // @ts-expect-error -- options cannot be scoped by files
  defineConfig(scopedOptions)
  // @ts-expect-error -- settings cannot be scoped by files
  void ({ files: ['src/**'], settings: {} } satisfies FlatConfigItem)
  const scopedSettings = { basePath: 'src', ignores: ['dist'], settings: {} }
  // @ts-expect-error -- ignores do not allow settings to be scoped by basePath
  defineConfig(scopedSettings)
  // @ts-expect-error -- ignores do not allow options to be scoped by files
  void ({ files: ['src/**'], ignores: ['dist'], options: {} } satisfies FlatConfigItem)
  // @ts-expect-error -- options cannot be scoped by basePath
  void ({ basePath: 'src', options: {} } satisfies FlatConfigItem)
  // @ts-expect-error -- ignores cannot limit root-only settings
  defineConfig({ settings: {}, ignores: ['generated/**'] })
})

it('checks the named config kinds', () => {
  // @ts-expect-error -- scoped configs require files or basePath
  void ({ rules: { 'no-console': 'error' } } satisfies ScopedConfigItem)
  const ignoreWithRules = { ignores: ['dist'], rules: { 'no-console': 'error' as const } }
  // @ts-expect-error -- rules make this an ordinary config
  void (ignoreWithRules satisfies GlobalIgnoresItem)
})

it('checks extensions through variables and nested arrays', () => {
  const scopedSettings = { files: ['src/**'], settings: {} }
  defineConfig({ extends: [[{ settings: {} }]] })
  // @ts-expect-error -- a nested preset cannot hide an invalid combination
  defineConfig({ extends: [[scopedSettings]] })
  // @ts-expect-error -- settings cannot be scoped inside an extension
  void ({ files: ['src/**'], settings: {} } satisfies ExtendsItem)
  // @ts-expect-error -- options cannot be scoped inside an extension
  void ({ files: ['src/**'], options: {} } satisfies ExtendsItem)
  const nestedExtension = { rules: { 'no-console': 'error' as const }, extends: [] }
  // @ts-expect-error -- extensions cannot extend again
  defineConfig({ extends: [nestedExtension] })
  const basedExtension = { rules: { 'no-console': 'error' as const }, basePath: 'src' }
  // @ts-expect-error -- extensions inherit basePath
  void (basedExtension satisfies ExtendsItem)
})

it('accepts helper results in extends', () => {
  defineConfig({
    extends: [
      [globalIgnores(['dist'])],
      includeIgnoreFile('/repo/.gitignore'),
      includeIgnoreFile(['/repo/.gitignore']),
      category({ correctness: 'error', plugins: ['eslint'] })
    ]
  })
  defineConfig({
    files: ['src/**'],
    extends: [category({ correctness: 'error', plugins: ['typescript'] }, { files: ['**/*.ts'] })]
  })
})

it('rejects plugins in config objects', () => {
  // @ts-expect-error -- every built-in plugin is enabled
  void ({ plugins: ['react'], rules: { 'react/jsx-key': 'error' } } satisfies FlatConfigItem)
})

it('requires plugins in category()', () => {
  // @ts-expect-error -- plugins decide which rules are included
  category({ correctness: 'error' })
})

it('accepts flat config in the Vite+ lint block', () => {
  defineViteConfig({ lint: [{ files: ['src/**'], rules: { 'no-console': 'warn' } }] })
  // oxlint-disable-next-line typescript/require-await -- severities returned from async callbacks must stay literal types
  defineViteConfig(async () => ({ lint: { rules: { 'no-console': 'warn' } } }))
  // @ts-expect-error -- use category() instead of Oxlint's categories
  void defineViteConfig({ lint: { categories: { correctness: 'error' } } })
})
