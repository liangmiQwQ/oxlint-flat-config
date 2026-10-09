import type { OxlintConfig, OxlintOverride } from 'oxlint'

import type { ExpandedConfigItem } from './extends.ts'
import { isGlobalIgnores } from './global-ignores.ts'
import { toIgnorePatterns, toOverridePaths } from './paths.ts'
import type { GlobalIgnoresItem } from './types.ts'

type ConfigItem = Exclude<ExpandedConfigItem, GlobalIgnoresItem>
type RootFields = Pick<OxlintConfig, 'categories' | 'settings' | 'options'>
type OverrideFields = Omit<OxlintOverride, 'files' | 'excludeFiles'>

// Oxlint only reads these fields in the root config, not in `overrides`.
const ROOT_ONLY_KEYS = new Set(['categories', 'settings', 'options'])

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

  return addOverrides(mergeIntoRoot(config, item), item)
}

// Same as ESLint, a later item wins key by key.
function mergeIntoRoot(config: OxlintConfig, item: ConfigItem): OxlintConfig {
  const { categories, settings, options } = toRootFields(item)
  return withoutUndefined({
    ...config,
    categories: mergeRecords(config.categories, categories),
    settings: mergeRecords(config.settings, settings),
    options: mergeRecords(config.options, options)
  })
}

// Oxlint applies every override after the root config, so other fields go into `overrides` to keep the item order.
function addOverrides(config: OxlintConfig, item: ConfigItem): OxlintConfig {
  const fields = toOverrideFields(item)
  if (Object.keys(fields).length === 0) {
    return config
  }

  // oxlint-disable-next-line oxc/no-map-spread -- An item usually makes one override, and each override needs its own object.
  const overrides = toOverridePaths(item).map(paths => ({ ...paths, ...fields }))
  return { ...config, overrides: [...(config.overrides ?? []), ...overrides] }
}

function toRootFields(item: ConfigItem): RootFields {
  // A config without `files` applies to every file in its `basePath`, which is every file when `basePath` is unset.
  if (!('files' in item) && item.basePath === undefined) {
    const { categories, settings, options } = item
    return { categories, settings, options }
  }

  const rootOnlyKey = Object.keys(item).find(key => ROOT_ONLY_KEYS.has(key))
  if (rootOnlyKey) {
    throw new TypeError(
      `'${rootOnlyKey}' is not allowed in "${item.name ?? 'unnamed config'}" with 'files' or 'basePath', Oxlint only reads it in the root config.`
    )
  }
  return {}
}

function toOverrideFields(item: ConfigItem): OverrideFields {
  const { plugins, jsPlugins, rules, env, globals } = item
  return withoutUndefined({ plugins, jsPlugins, rules, env, globals })
}

function mergeRecords<T extends object>(base: T | undefined, next: T | undefined): T | undefined {
  return base && next ? { ...base, ...next } : (next ?? base)
}

function withoutUndefined<T extends object>(object: T): T {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as T
}
