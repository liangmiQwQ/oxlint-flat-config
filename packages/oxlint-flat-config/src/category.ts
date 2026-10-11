import { getRules } from 'get-oxlint-rules'
import type { OxlintRule } from 'get-oxlint-rules'
import type { DummyRuleMap, RuleCategories } from 'oxlint'

import { markCategories } from './core/category.ts'
import type { GlobalConfigItem, ScopedConfigItem } from './core/types.ts'

export interface CategoryOptions {
  /** The name to give the output config object. */
  name?: string
}

export interface ScopedCategoryOptions extends CategoryOptions {
  files: NonNullable<ScopedConfigItem['files']>
  ignores?: string[]
}

// Category presets only contain rules and metadata, so they can also be used in extends.
type CategoryConfig = Pick<GlobalConfigItem, 'name' | 'rules'>

// Shared by every `category()` call, so Oxlint runs at most once per process.
let rulesPromise: Promise<OxlintRule[]> | undefined

/**
 * Turns Oxlint categories into a flat config object with an explicit rule for every rule in them.
 *
 * The result follows flat config order: later config objects override it, and it overrides earlier ones.
 * When nothing before it sets rules, `defineConfig` writes it as Oxlint's root `categories` instead.
 */
export async function category(
  categories: RuleCategories,
  options: ScopedCategoryOptions
): Promise<CategoryConfig & ScopedCategoryOptions>
export async function category(
  categories: RuleCategories,
  options?: CategoryOptions
): Promise<CategoryConfig>
export async function category(
  categories: RuleCategories,
  options: CategoryOptions | ScopedCategoryOptions = {}
): Promise<GlobalConfigItem | ScopedConfigItem> {
  const rules = toRuleMap(await loadRules(), categories)
  markCategories(rules, categories)

  return {
    ...options,
    name: options.name ?? `category ${Object.keys(categories).join(', ')}`,
    rules
  }
}

function loadRules(): Promise<OxlintRule[]> {
  // Resolve Oxlint from this package, which declares it as a peer dependency, so pnpm's strict layout can't hide it.
  rulesPromise ??= getRules({ cwd: import.meta.dirname })
  return rulesPromise
}

function toRuleMap(rules: OxlintRule[], categories: RuleCategories): DummyRuleMap {
  const entries = rules
    .filter(rule => categories[rule.category] !== undefined)
    .map(rule => [toRuleKey(rule), categories[rule.category]])
  return Object.fromEntries(entries)
}

function toRuleKey(rule: OxlintRule): string {
  // `Oxlint --rules` reports scopes like `jsx_a11y`, while configs name the plugin `jsx-a11y`.
  return `${rule.scope.replaceAll('_', '-')}/${rule.value}`
}
