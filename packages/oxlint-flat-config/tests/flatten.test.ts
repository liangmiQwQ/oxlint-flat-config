import { expect, it } from 'vite-plus/test'

import { flattenConfigs } from '../src/core/flatten.ts'
import type { ConfigInput } from '../src/index.ts'

it('flattens nested arrays and skips falsy values', () => {
  const a = { rules: { 'eslint/no-debugger': 'error' as const } }
  const b = { files: ['**/*.ts'], rules: { 'eslint/curly': 'off' as const } }

  expect(flattenConfigs([a, [false, [null, b]], undefined])).toEqual([a, b])
})

it('places extended configs before the config, scoped by its `files` and `ignores`', () => {
  const configs: ConfigInput[] = [
    { rules: {} },
    {
      files: ['src/**'],
      ignores: ['src/legacy/**'],
      extends: [
        { name: 'ts', files: ['**/*.ts', ['**/*.tsx', '!**/*.d.tsx']], ignores: ['**/*.gen.ts'] },
        [{ rules: { 'eslint/curly': 'error' } }]
      ],
      rules: { 'eslint/no-debugger': 'error' }
    }
  ]

  expect(flattenConfigs(configs)).toEqual([
    { rules: {} },
    {
      name: 'UserConfig[1] > ts',
      files: [
        ['src/**', '**/*.ts'],
        ['src/**', '**/*.tsx', '!**/*.d.tsx']
      ],
      ignores: ['src/legacy/**', '**/*.gen.ts']
    },
    {
      name: 'UserConfig[1] > ExtendedConfig[1][0]',
      files: ['src/**'],
      ignores: ['src/legacy/**'],
      rules: { 'eslint/curly': 'error' }
    },
    {
      files: ['src/**'],
      ignores: ['src/legacy/**'],
      rules: { 'eslint/no-debugger': 'error' }
    }
  ])
})

it('keeps extended global ignores global', () => {
  const configs: ConfigInput[] = [
    { name: 'base', files: ['src/**'], extends: [{ ignores: ['dist/**'] }], rules: {} }
  ]

  expect(flattenConfigs(configs)).toEqual([
    { name: 'base > ExtendedConfig[0]', ignores: ['dist/**'] },
    { name: 'base', files: ['src/**'], rules: {} }
  ])
})

it('rejects nested `extends`', () => {
  // Types forbid this, but plain JS configs can still nest `extends`.
  const nested = { extends: [{ rules: {} }] } as never

  expect(() => flattenConfigs([{ name: 'base', extends: [nested] }])).toThrow(
    `Nested 'extends' is not allowed in "base > ExtendedConfig[0]".`
  )
})
