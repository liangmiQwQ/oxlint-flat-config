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
export interface FlatConfigItem {
  /** A label for this config object, used in error messages and config inspection. */
  name?: string
  /** Glob patterns this config applies to. Omit to apply to every file. */
  files?: string[]
  /** Glob patterns excluded from this config. With no `files`, they are global ignores. */
  ignores?: string[]

  /** Built-in Rust plugins to enable. Overwrites oxlint's default plugin set. */
  plugins?: OxlintConfig['plugins']
  /** ESLint-compatible JS plugins. */
  jsPlugins?: ExternalPluginEntry[]
  rules?: DummyRuleMap
  env?: OxlintEnv
  globals?: OxlintGlobals

  // The fields below are root-only in oxlint, so they are rejected when `files` is set.
  categories?: RuleCategories
  settings?: OxlintConfig['settings']
  options?: OxlintConfig['options']
}

/** The `{ name, ignores }` shape produced by `globalIgnores` and `includeIgnoreFile`. */
export interface GlobalIgnoresItem extends FlatConfigItem {
  name: string
  ignores: string[]
}

// Same as `@eslint/config-helpers`: nested arrays and falsy values let users spread presets and write `cond && config`.
export type ConfigInput = FlatConfigItem | ConfigInput[] | false | null | undefined
