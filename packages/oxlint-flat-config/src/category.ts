import { getRules } from 'get-oxlint-rules'
import type { OxlintRule } from 'get-oxlint-rules'
import type { DummyRuleMap, OxlintConfig, RuleCategories } from 'oxlint'

import type { GlobalConfigItem, ScopedConfigItem } from './core/types.ts'

export interface CategoryOptions {
  /** The name to give the output config object. */
  name?: string
  /** Only include rules from these plugins, and enable them. Defaults to Oxlint's default plugins. */
  plugins?: Plugins
}

export interface ScopedCategoryOptions extends CategoryOptions {
  files: NonNullable<ScopedConfigItem['files']>
  ignores?: string[]
}

// Category presets only contain rules and metadata, so they can also be used in extends.
type CategoryConfig = Pick<GlobalConfigItem, 'name' | 'plugins' | 'rules'>
type Plugins = NonNullable<OxlintConfig['plugins']>

// Same as the plugins Oxlint enables when a config doesn't set `plugins`.
const DEFAULT_PLUGINS: Plugins = ['eslint', 'typescript', 'unicorn', 'oxc']

// Shared by every `category()` call, so Oxlint runs at most once per process.
let rulesPromise: Promise<OxlintRule[]> | undefined

/**
 * Turns Oxlint categories into a flat config object with an explicit rule for every rule in them.
 *
 * Unlike oxlint's `categories` field, the result follows flat config order: later config objects override it, and it overrides earlier ones.
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
  const plugins = options.plugins ?? DEFAULT_PLUGINS
  const rules = (await loadRules()).filter(rule => plugins.includes(toPluginName(rule)))

  // Oxlint drops an override's rules whose plugin is enabled by another override (oxc-project/oxc#27259), so the object enables its own plugins.
  return {
    ...options,
    name: options.name ?? `category ${Object.keys(categories).join(', ')}`,
    plugins,
    rules: toRuleMap(rules, categories)
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
  return `${toPluginName(rule)}/${rule.value}`
}

function toPluginName(rule: OxlintRule): Plugins[number] {
  // `Oxlint --rules` reports scopes like `jsx_a11y`, while configs name the plugin `jsx-a11y`.
  return rule.scope.replaceAll('_', '-') as Plugins[number]
}
