import { getRules } from 'get-oxlint-rules'
import type { OxlintRule } from 'get-oxlint-rules'
import type { DummyRuleMap, RuleCategories } from 'oxlint'

import type { GlobalConfigItem, ScopedConfigItem } from './core/types.ts'

export interface CategoryOptions {
  /** The name to give the output config object. */
  name?: string
}

export interface ScopedCategoryOptions extends CategoryOptions {
  files: ScopedConfigItem['files']
  ignores?: string[]
}

// Shared by every `category()` call, so oxlint runs at most once per process.
let rulesPromise: Promise<OxlintRule[]> | undefined

/**
 * Turns oxlint categories into a flat config object with an explicit rule for every rule in them.
 *
 * Unlike oxlint's `categories` field, the result follows flat config order: later config objects override it, and it overrides earlier ones.
 */
export async function category(
  categories: RuleCategories,
  options: ScopedCategoryOptions
): Promise<ScopedConfigItem>
export async function category(
  categories: RuleCategories,
  options?: CategoryOptions
): Promise<GlobalConfigItem>
export async function category(
  categories: RuleCategories,
  options: CategoryOptions | ScopedCategoryOptions = {}
): Promise<GlobalConfigItem | ScopedConfigItem> {
  const rules = await loadRules()

  return {
    ...options,
    name: options.name ?? `category ${Object.keys(categories).join(', ')}`,
    rules: toRuleMap(rules, categories)
  }
}

function loadRules(): Promise<OxlintRule[]> {
  // Resolve oxlint from this package, which declares it as a peer dependency, so pnpm's strict layout can't hide it.
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
  // `oxlint --rules` reports scopes like `jsx_a11y`, while configs name the plugin `jsx-a11y`.
  return `${rule.scope.replaceAll('_', '-')}/${rule.value}`
}
