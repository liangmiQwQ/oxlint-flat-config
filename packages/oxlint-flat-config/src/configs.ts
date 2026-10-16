import type { Category } from './category.ts'
import type { Plugins } from './core/index.ts'

/** Builds the `recommended` and `all` presets from one Oxlint copy's categories and plugins. */
export function createPresets(category: Category, plugins: Plugins) {
  return {
    recommended: category(
      { correctness: 'error', plugins: ['eslint', 'typescript', 'unicorn', 'oxc'] },
      { name: 'oxlint/recommended' }
    ),
    all: category(
      {
        correctness: 'error',
        suspicious: 'error',
        pedantic: 'error',
        perf: 'error',
        style: 'error',
        restriction: 'error',
        plugins
      },
      { name: 'oxlint/all' }
    )
  }
}
