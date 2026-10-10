import { it } from 'vite-plus/test'

import { category, defineConfig, globalIgnores, includeIgnoreFile } from '../src/index.ts'
import type {
  ExtendsItem,
  FlatConfigItem,
  GlobalIgnoresItem,
  ScopedConfigItem
} from '../src/index.ts'

it('accepts configs, nested arrays and falsy entries', () => {
  const configs = [
    {},
    { rules: { 'no-console': 'warn' }, ignores: ['generated/**'] },
    { categories: { correctness: 'error' }, ignores: ['generated/**'] },
    { files: ['src/**'], rules: { 'no-console': 'error' } },
    { basePath: 'packages/a', rules: { 'no-console': 'error' } },
    { files: ['*.ts'], basePath: 'packages/a' },
    { basePath: 'packages/a', ignores: ['dist'] }
  ] satisfies FlatConfigItem[]
  defineConfig(configs, [false, null, undefined, [configs]])
})

it('rejects root-only fields with either kind of scope', () => {
  const scopedCategories = { files: ['src/**'], categories: { correctness: 'error' as const } }
  // @ts-expect-error -- categories cannot be scoped by files
  defineConfig(scopedCategories)
  // @ts-expect-error -- categories cannot be scoped by basePath
  void ({ basePath: 'src', categories: { correctness: 'error' } } satisfies FlatConfigItem)
  // @ts-expect-error -- settings cannot be scoped by files
  void ({ files: ['src/**'], settings: {} } satisfies FlatConfigItem)
  const scopedSettings = { basePath: 'src', ignores: ['dist'], settings: {} }
  // @ts-expect-error -- ignores do not allow settings to be scoped by basePath
  defineConfig(scopedSettings)
  // @ts-expect-error -- ignores do not allow options to be scoped by files
  void ({ files: ['src/**'], ignores: ['dist'], options: {} } satisfies FlatConfigItem)
  // @ts-expect-error -- options cannot be scoped by basePath
  void ({ basePath: 'src', options: {} } satisfies FlatConfigItem)
})

it('checks the named config kinds', () => {
  // @ts-expect-error -- scoped configs require files or basePath
  void ({ rules: { 'no-console': 'error' } } satisfies ScopedConfigItem)
  const ignoreWithRules = { ignores: ['dist'], rules: { 'no-console': 'error' as const } }
  // @ts-expect-error -- rules make this an ordinary config
  void (ignoreWithRules satisfies GlobalIgnoresItem)
})

it('checks extensions through variables and nested arrays', () => {
  const scopedCategories = { files: ['src/**'], categories: { correctness: 'error' as const } }
  defineConfig({ extends: [[{ categories: { correctness: 'error' } }]] })
  // @ts-expect-error -- a nested preset cannot hide an invalid combination
  defineConfig({ extends: [[scopedCategories]] })
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

it('accepts helper results in extends', async () => {
  defineConfig({
    extends: [
      [globalIgnores(['dist'])],
      includeIgnoreFile('/repo/.gitignore'),
      includeIgnoreFile(['/repo/.gitignore']),
      await category({ correctness: 'error' })
    ]
  })
  defineConfig({
    files: ['src/**'],
    extends: [await category({ correctness: 'error' }, { files: ['**/*.ts'] })]
  })
})
