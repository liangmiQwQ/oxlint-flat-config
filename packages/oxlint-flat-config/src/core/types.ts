import type {
  DummyRuleMap,
  ExternalPluginEntry,
  OxlintConfig,
  OxlintEnv,
  OxlintGlobals,
  RuleCategories
} from 'oxlint'

/**
 * One ESLint-style flat config object.
 *
 * How it maps onto `OxlintConfig`:
 * - only `ignores` (plus optional `name`): a global ignore, goes into `ignorePatterns`
 * - no `files`: merged into the root config
 * - with `files`: becomes an `overrides` entry, where `ignores` becomes `excludeFiles`
 */
export type FlatConfigItem = GlobalConfigItem | ScopedConfigItem

/** Applies to every file. The only item kind that may carry oxlint's root-only fields. */
export interface GlobalConfigItem extends BaseConfigItem {
  // `never` keeps the union discriminated: an object with `files` can only be a `ScopedConfigItem`.
  files?: never
  /** Glob patterns to ignore globally. */
  ignores?: string[]

  categories?: RuleCategories
  settings?: OxlintConfig['settings']
  options?: OxlintConfig['options']
}

/** Applies only to `files`. */
export interface ScopedConfigItem extends BaseConfigItem {
  /** Glob patterns this config applies to. */
  files: string[]
  /** Glob patterns excluded from this config. They are not ignored globally. */
  ignores?: string[]

  // Root-only in oxlint. Declared as `never` so TypeScript rejects them here instead of silently accepting them.
  categories?: never
  settings?: never
  options?: never
}

/** The `{ name, ignores }` shape produced by `globalIgnores` and `includeIgnoreFile`. */
export interface GlobalIgnoresItem {
  name: string
  ignores: string[]
}

// Same as `@eslint/config-helpers`: nested arrays and falsy values let users spread presets and write `cond && config`.
export type ConfigInput = FlatConfigItem | ConfigInput[] | false | null | undefined

/** Fields allowed on every config item. */
interface BaseConfigItem {
  /** A label for this config object, used in error messages and config inspection. */
  name?: string
  /** Built-in Rust plugins to enable. Overwrites oxlint's default plugin set. */
  plugins?: OxlintConfig['plugins']
  /** ESLint-compatible JS plugins. */
  jsPlugins?: ExternalPluginEntry[]
  rules?: DummyRuleMap
  env?: OxlintEnv
  globals?: OxlintGlobals
}
