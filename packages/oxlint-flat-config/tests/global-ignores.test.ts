import { expect, it } from 'vite-plus/test'

import { globalIgnores } from '../src/index.ts'

it('wraps patterns into a flat config `ignores` entry with the given name', () => {
  expect(globalIgnores(['dist/**', 'coverage/**'], 'build')).toEqual({
    name: 'build',
    ignores: ['dist/**', 'coverage/**']
  })
})

it('generates a unique name when none is given', () => {
  const first = globalIgnores(['a/**'])
  const second = globalIgnores(['b/**'])

  expect(first.name).toMatch(/^globalIgnores \d+$/)
  expect(second.name).toMatch(/^globalIgnores \d+$/)
  expect(second.name).not.toBe(first.name)
})

it('rejects an empty pattern list', () => {
  expect(() => globalIgnores([])).toThrow('must contain at least one pattern')
})
