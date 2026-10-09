import { expect, it } from 'vite-plus/test'

import { defineConfig } from '../src/index.ts'

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

it('flattens nested config arrays in order and skips falsy values', () => {
  const config = defineConfig(
    [{ files: ['a/**'], rules: { 'no-console': 'error' } }, [false, null]],
    undefined,
    [[{ files: ['b/**'], rules: { 'no-console': 'off' } }]]
  )

  expect(config.overrides).toEqual([
    { files: ['a/**'], excludeFiles: [], rules: { 'no-console': 'error' } },
    { files: ['b/**'], excludeFiles: [], rules: { 'no-console': 'off' } }
  ])
})

it('merges root-only fields of unscoped configs, a later one winning key by key', () => {
  expect(
    defineConfig(
      {
        categories: { correctness: 'error', perf: 'warn' },
        settings: { react: { version: '18' } }
      },
      { categories: { perf: 'off' }, options: { typeAware: true } }
    )
  ).toEqual({
    categories: { correctness: 'error', perf: 'off' },
    settings: { react: { version: '18' } },
    options: { typeAware: true }
  })
})

it('rejects root-only fields in a scoped config', () => {
  expect(() =>
    defineConfig({ name: 'scoped', files: ['src/**'], categories: { correctness: 'error' } })
  ).toThrow(`'categories' is not allowed in "scoped" with 'files' or 'basePath'`)
})

it('turns global ignores into root-anchored `ignorePatterns`', () => {
  expect(
    defineConfig(
      { ignores: ['dist', 'src/gen/**'] },
      { basePath: 'packages/a', ignores: ['*.log'] }
    )
  ).toEqual({ ignorePatterns: ['/dist', '/src/gen/**', '/packages/a/*.log'] })
})

it('turns `files` and `ignores` into an override with `excludeFiles`', () => {
  expect(
    defineConfig({
      files: ['*.ts', 'src/**'],
      ignores: ['src/legacy/**'],
      rules: { 'no-console': 'error' }
    })
  ).toEqual({
    overrides: [
      {
        // Oxlint matches a pattern without `/` at any depth, so it is pinned to the base directory like ESLint.
        files: ['./*.ts', 'src/**'],
        excludeFiles: ['src/legacy/**'],
        rules: { 'no-console': 'error' }
      }
    ]
  })
})

it('resolves `files` and `ignores` against `basePath`', () => {
  expect(
    defineConfig({
      basePath: 'packages/a',
      files: ['*.ts'],
      ignores: ['dist'],
      rules: { 'no-console': 'error' }
    })
  ).toEqual({
    overrides: [
      {
        files: ['packages/a/*.ts'],
        excludeFiles: ['packages/a/dist'],
        rules: { 'no-console': 'error' }
      }
    ]
  })
})

it('splits an AND group in `files` into included and excluded patterns', () => {
  expect(
    defineConfig({ files: [['src/**', '!src/legacy/**']], rules: { 'no-console': 'error' } })
  ).toEqual({
    overrides: [
      { files: ['src/**'], excludeFiles: ['src/legacy/**'], rules: { 'no-console': 'error' } }
    ]
  })
})

it('rejects a `basePath` that is absolute or outside the config directory', () => {
  expect(() => defineConfig({ basePath: '/repo', ignores: ['dist'] })).toThrow('must be relative')
  expect(() => defineConfig({ basePath: 'a/../..', ignores: ['dist'] })).toThrow(
    "must stay inside the config file's directory"
  )
})

it('rejects negated patterns in scoped `ignores`', () => {
  expect(() =>
    defineConfig({ files: ['src/**'], ignores: ['!src/keep.ts'], rules: { 'no-console': 'error' } })
  ).toThrow('Negated pattern "!src/keep.ts"')
})

it('places extended configs before the config, inheriting its `files` and `ignores`', () => {
  expect(
    defineConfig({
      files: ['src/**'],
      ignores: ['src/legacy/**'],
      extends: [{ files: ['**/*.ts'], rules: { 'no-console': 'error' } }],
      rules: { 'no-debugger': 'warn' }
    })
  ).toEqual({
    overrides: [
      { files: ['src/**/*.ts'], excludeFiles: ['src/legacy/**'], rules: { 'no-console': 'error' } },
      { files: ['src/**'], excludeFiles: ['src/legacy/**'], rules: { 'no-debugger': 'warn' } }
    ]
  })
})

it('passes `basePath` down to extended configs', () => {
  expect(
    defineConfig({
      basePath: 'packages/a',
      extends: [{ files: ['*.ts'], rules: { 'no-console': 'error' } }]
    })
  ).toEqual({
    overrides: [{ files: ['packages/a/*.ts'], excludeFiles: [], rules: { 'no-console': 'error' } }]
  })
})

it('keeps global ignores in `extends` global', () => {
  expect(
    defineConfig({
      files: ['src/**'],
      extends: [{ ignores: ['tmp'] }],
      rules: { 'no-console': 'error' }
    })
  ).toEqual({
    ignorePatterns: ['/tmp'],
    overrides: [{ files: ['src/**'], excludeFiles: [], rules: { 'no-console': 'error' } }]
  })
})

it('does not turn a config with only `ignores` and `extends` into a global ignore', () => {
  expect(
    defineConfig({ ignores: ['src/legacy/**'], extends: [{ rules: { 'no-console': 'error' } }] })
  ).toEqual({
    overrides: [
      { files: ['**/*'], excludeFiles: ['src/legacy/**'], rules: { 'no-console': 'error' } }
    ]
  })
})

it('rejects `extends` and `basePath` in an extended config', () => {
  expect(() =>
    // @ts-expect-error -- extended configs can't have `extends`
    defineConfig({ extends: [{ extends: [] }] })
  ).toThrow(`Nested 'extends' is not allowed in "UserConfig[0] > ExtendedConfig[0]"`)
  expect(() =>
    // @ts-expect-error -- extended configs can't have `basePath`
    defineConfig({ name: 'base', extends: [{ name: 'preset', basePath: 'a' }] })
  ).toThrow(`'basePath' is not allowed in "base > preset"`)
})
