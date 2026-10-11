import { getRules } from 'get-oxlint-rules'
import { expect, it } from 'vite-plus/test'

import { all, recommended } from '../src/index.ts'

it('keeps recommended limited to correctness rules from default plugins', () => {
  expect(recommended.rules).toMatchObject({
    'eslint/no-debugger': 'error',
    'unicorn/no-new-array': 'error'
  })
  expect(recommended.rules).not.toHaveProperty('eslint/curly')
  expect(recommended.rules).not.toHaveProperty('react/jsx-key')
})

it('includes optional plugins and non-correctness rules in all, but excludes nursery', async () => {
  expect(all.rules).toMatchObject({
    'eslint/no-debugger': 'error',
    'eslint/curly': 'error',
    'react/jsx-key': 'error',
    'jsx-a11y/alt-text': 'error'
  })

  // Nursery membership changes between Oxlint releases.
  const nurseryRules = (await getRules()).filter(rule => rule.category === 'nursery')
  for (const rule of nurseryRules) {
    expect(all.rules).not.toHaveProperty(`${rule.scope.replaceAll('_', '-')}/${rule.value}`)
  }
})
