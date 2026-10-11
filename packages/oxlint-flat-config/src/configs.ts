import { getOxlintPlugins } from 'get-oxlint-rules'
import type { OxlintConfig } from 'oxlint'

import { category } from './category.ts'

/** Correctness rules from Oxlint's default plugins, reported as errors. */
export const recommended = await category(
  { correctness: 'error', plugins: ['eslint', 'typescript', 'unicorn', 'oxc'] },
  { name: 'oxlint/recommended' }
)

/** All built-in rules except nursery rules, matching Oxlint's `all` category. */
export const all = await category(
  {
    correctness: 'error',
    suspicious: 'error',
    pedantic: 'error',
    perf: 'error',
    style: 'error',
    restriction: 'error',
    plugins: (await getOxlintPlugins({ cwd: import.meta.dirname })) as NonNullable<
      OxlintConfig['plugins']
    >
  },
  { name: 'oxlint/all' }
)
