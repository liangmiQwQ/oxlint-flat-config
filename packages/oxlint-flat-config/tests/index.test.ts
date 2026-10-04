import { expect, it } from 'vite-plus/test'

import { defineConfig, globalIgnores } from '../src/index.ts'

it('defineConfig', () => {
  expect(() => {
    defineConfig()
  }).toThrow('Not implemented yet')
})

it('globalIgnores', () => {
  expect(globalIgnores(['dist/**'], 'build')).toEqual({ name: 'build', ignores: ['dist/**'] })

  // Unnamed calls get a unique generated name so they can be told apart.
  const [first, second] = [globalIgnores(['a/**']), globalIgnores(['b/**'])]
  expect(first.name).toMatch(/^globalIgnores \d+$/)
  expect(second.name).not.toBe(first.name)

  expect(() => globalIgnores([])).toThrow('must contain at least one pattern')
})
