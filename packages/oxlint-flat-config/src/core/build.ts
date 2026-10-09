import type { OxlintConfig, OxlintOverride } from 'oxlint'

import type { ExpandedConfigItem } from './extends.ts'
import { isGlobalIgnores } from './global-ignores.ts'
import { toIgnorePatterns, toOverridePaths } from './paths.ts'
import type { GlobalConfigItem, GlobalIgnoresItem } from './types.ts'

type ConfigItem = Exclude<ExpandedConfigItem, GlobalIgnoresItem>

// Oxlint only reads these fields in the root config, not in `overrides`.
const ROOT_ONLY_KEYS = new Set(['categories', 'settings', 'options'])

// TODO: test through `defineConfig`
/** Builds an Oxlint config from flat config items, following their order. */
export function buildOxlintConfig(items: ExpandedConfigItem[]): OxlintConfig {
  let config: OxlintConfig = {}
  for (const item of items) {
    config = addItem(config, item)
  }
  return config
}

function addItem(config: OxlintConfig, item: ExpandedConfigItem): OxlintConfig {
  if (isGlobalIgnores(item)) {
    return {
      ...config,
      ignorePatterns: [...(config.ignorePatterns ?? []), ...toIgnorePatterns(item)]
    }
  }

  // A config without `files` applies to every file in its `basePath`, which is every file when `basePath` is unset.
  if (!('files' in item) && item.basePath === undefined) {
    return mergeIntoRoot(config, item)
  }

  const fields = toOverrideFields(item)
  // oxlint-disable-next-line oxc/no-map-spread -- An item usually makes one override, and each override needs its own object.
  const overrides = toOverridePaths(item).map(paths => ({ ...paths, ...fields }))
  return { ...config, overrides: [...(config.overrides ?? []), ...overrides] }
}

// Same as ESLint, a later item wins key by key, and plugins add up instead of replacing the earlier ones.
function mergeIntoRoot(
  config: OxlintConfig,
  item: Omit<GlobalConfigItem, 'extends'>
): OxlintConfig {
  return withoutUndefined({
    ...config,
    plugins: mergeLists(config.plugins, item.plugins),
    jsPlugins: mergeLists(config.jsPlugins ?? undefined, item.jsPlugins),
    rules: mergeRecords(config.rules, item.rules),
    env: mergeRecords(config.env, item.env),
    globals: mergeRecords(config.globals, item.globals),
    categories: mergeRecords(config.categories, item.categories),
    settings: mergeRecords(config.settings, item.settings),
    options: mergeRecords(config.options, item.options)
  })
}

function toOverrideFields(item: ConfigItem): Omit<OxlintOverride, 'files' | 'excludeFiles'> {
  const rootOnlyKey = Object.keys(item).find(key => ROOT_ONLY_KEYS.has(key))
  if (rootOnlyKey) {
    throw new TypeError(
      `'${rootOnlyKey}' is not allowed in "${item.name ?? 'unnamed config'}" with 'basePath', Oxlint only reads it in the root config.`
    )
  }

  const { plugins, jsPlugins, rules, env, globals } = item
  return withoutUndefined({ plugins, jsPlugins, rules, env, globals })
}

function mergeLists<T>(base: T[] | undefined, next: T[] | undefined): T[] | undefined {
  return base && next ? [...new Set([...base, ...next])] : (next ?? base)
}

function mergeRecords<T extends object>(base: T | undefined, next: T | undefined): T | undefined {
  return base && next ? { ...base, ...next } : (next ?? base)
}

function withoutUndefined<T extends object>(object: T): T {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as T
}
