import type { Category } from './category.ts'
import type { Plugins } from './core/index.ts'

/** Builds the `recommended` and `all` presets from one Oxlint copy's categories and plugins. */
export async function createPresets(category: Category, plugins: Plugins) {
  return {
    recommended: await category(
      { correctness: 'error', plugins: ['eslint', 'typescript', 'unicorn', 'oxc'] },
      { name: 'oxlint/recommended' }
    ),
    all: await category(
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
