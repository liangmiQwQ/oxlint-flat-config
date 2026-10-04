import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, expect, it } from 'vite-plus/test'

import { includeIgnoreFile } from '../src/index.ts'

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oxlint-flat-config-'))
})

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

function writeIgnoreFile(name: string, content: string): string {
  const file = path.join(dir, name)
  fs.writeFileSync(file, content)
  return file
}

it('converts gitignore patterns into a flat config `ignores` entry', () => {
  const file = writeIgnoreFile(
    '.gitignore',
    [
      '# comment',
      '',
      'node_modules',
      '/dist',
      'build/',
      'coverage/**',
      'src/{a,b}.js',
      '!keep.js',
      '**'
    ].join('\n')
  )

  expect(includeIgnoreFile(file)).toEqual({
    name: 'Imported .gitignore patterns',
    ignores: [
      '**/node_modules',
      'dist',
      '**/build/',
      'coverage/**/*',
      String.raw`src/\{a,b}.js`,
      '!**/keep.js',
      '**'
    ]
  })
})

it('accepts a custom name as an option or a plain string', () => {
  const file = writeIgnoreFile('.gitignore', 'dist\n')

  expect(includeIgnoreFile(file, { name: 'custom' }).name).toBe('custom')
  expect(includeIgnoreFile(file, 'legacy').name).toBe('legacy')
})

it('returns one config per file when given an array', () => {
  const a = writeIgnoreFile('.gitignore', 'dist\n')
  const b = writeIgnoreFile('.prettierignore', 'coverage\n')

  expect(includeIgnoreFile([a, b])).toEqual([
    { name: 'Imported .gitignore patterns (0)', ignores: ['**/dist'] },
    { name: 'Imported .gitignore patterns (1)', ignores: ['**/coverage'] }
  ])
})

it('rejects relative paths', () => {
  expect(() => includeIgnoreFile('.gitignore')).toThrow('must be an absolute path')
})
