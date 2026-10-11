import type { OxlintConfig, OxlintOverride } from 'oxlint'

import type { ExpandedConfigItem } from './extends.ts'
import { isGlobalIgnores } from './global-ignores.ts'
import { toIgnorePatterns, toOverridePaths } from './paths.ts'
import { inferPlugins } from './plugins.ts'
import type { GlobalIgnoresItem } from './types.ts'

type ConfigItem = Exclude<ExpandedConfigItem, GlobalIgnoresItem>
type RootFields = Pick<OxlintConfig, 'settings' | 'options'>
type OverrideFields = Omit<OxlintOverride, 'files' | 'excludeFiles'>

// Oxlint only reads these fields in the root config, not in `overrides`.
const ROOT_ONLY_KEYS = new Set(['settings', 'options'])

/** Builds an Oxlint config from flat config items, following their order. */
export function buildOxlintConfig(items: ExpandedConfigItem[]): OxlintConfig {
  // To clear Oxlint's default rules
  let config: OxlintConfig = { categories: { correctness: 'off' } }

  for (const item of items) {
    config = addItem(config, item)
  }

  // Oxlint only runs an override's rules when their plugin is enabled in the root or the same override, and some `import` rules need it in the root.
  // So every plugin the rules use is enabled in the root, replacing Oxlint's defaults. A plugin without enabled rules does nothing.
  return { ...config, plugins: inferPlugins(config.overrides ?? []) }
}

function addItem(config: OxlintConfig, item: ExpandedConfigItem): OxlintConfig {
  if (isGlobalIgnores(item)) {
    return {
      ...config,
      ignorePatterns: [...(config.ignorePatterns ?? []), ...toIgnorePatterns(item)]
    }
  }

  // Oxlint applies `categories` before every rule, which would break the array order, so `category()` expands them into rules instead.
  if ('categories' in item) {
    throw new TypeError(
      `'categories' is not allowed in "${item.name ?? 'unnamed config'}", use category() instead.`
    )
  }

  return addOverrides(mergeIntoRoot(config, item), item)
}

// Same as ESLint, a later item wins key by key.
function mergeIntoRoot(config: OxlintConfig, item: ConfigItem): OxlintConfig {
  const { settings, options } = toRootFields(item)
  return withoutUndefined({
    ...config,
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
    const { settings, options } = item
    return { settings, options }
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
  const { jsPlugins, rules, env, globals } = item
  return withoutUndefined({ jsPlugins, rules, env, globals })
}

function mergeRecords<T extends object>(base: T | undefined, next: T | undefined): T | undefined {
  return base && next ? { ...base, ...next } : (next ?? base)
}

function withoutUndefined<T extends object>(object: T): T {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as T
}
