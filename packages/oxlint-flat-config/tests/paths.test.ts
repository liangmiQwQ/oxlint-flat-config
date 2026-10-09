import { expect, it } from 'vite-plus/test'

import { toOxlintPaths } from '../src/core/paths.ts'

it('anchors global ignores to `basePath` as gitignore patterns', () => {
  expect(toOxlintPaths({ ignores: ['dist', './build/', '**/node_modules', '!keep.js'] })).toEqual([
    { ignores: ['/dist', '/build/', '/**/node_modules', '!/keep.js'] }
  ])
  expect(toOxlintPaths({ basePath: 'packages/a', ignores: ['dist'] })).toEqual([
    { ignores: ['/packages/a/dist'] }
  ])
})

it('keeps patterns without `/` in the base directory', () => {
  const item = { files: ['*.js', '**/*.ts'], ignores: ['*.gen.js'], rules: {} }

  expect(toOxlintPaths(item)).toEqual([
    { files: ['./*.js', '**/*.ts'], ignores: ['./*.gen.js'], rules: {} }
  ])
})

it('splits AND groups in `files` into overrides that share their exclusions', () => {
  const item = {
    files: [['src/**', '**/*.ts'], ['src/**', '**/*.tsx', '!**/*.d.tsx'], '*.cjs'],
    ignores: ['src/legacy/**'],
    rules: {}
  }

  expect(toOxlintPaths(item)).toEqual([
    { files: ['src/**/*.ts', './*.cjs'], ignores: ['src/legacy/**'], rules: {} },
    { files: ['src/**/*.tsx'], ignores: ['**/*.d.tsx', 'src/legacy/**'], rules: {} }
  ])
})

it('scopes a config to its `basePath`', () => {
  expect(toOxlintPaths({ basePath: 'packages/a', files: ['*.js'], rules: {} })).toEqual([
    { files: ['packages/a/*.js'], rules: {} }
  ])
  expect(toOxlintPaths({ basePath: './packages/a/', rules: {} })).toEqual([
    { files: ['packages/a/**'], rules: {} }
  ])
})

it('rejects paths Oxlint cannot match', () => {
  expect(() => toOxlintPaths({ basePath: '/repo', rules: {} })).toThrow('must be relative')
  expect(() => toOxlintPaths({ basePath: '../shared', rules: {} })).toThrow(
    "must stay inside the config file's directory"
  )
  expect(() => toOxlintPaths({ files: ['**/*.js'], ignores: ['!keep.js'], rules: {} })).toThrow(
    'Negated pattern "!keep.js"'
  )
})
