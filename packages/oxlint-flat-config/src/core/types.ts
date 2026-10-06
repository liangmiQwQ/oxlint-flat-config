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
export type FlatConfigItem = GlobalIgnoresItem | GlobalConfigItem | ScopedConfigItem

/** Applies to every file. The only item kind that may carry oxlint's root-only fields. */
export interface GlobalConfigItem extends BaseConfigItem, ExtendableConfigItem {
  categories?: RuleCategories
  settings?: OxlintConfig['settings']
  options?: OxlintConfig['options']
}

/** Applies only to `files`. */
export interface ScopedConfigItem extends BaseConfigItem, ExtendableConfigItem {
  /** Glob patterns this config applies to. */
  files: (string | string[])[]
  /** Glob patterns excluded from this config. They are not ignored globally. */
  ignores?: string[]
}

/** Ignore files globally. Create with `globalIgnores` and `includeIgnoreFile`. */
export interface GlobalIgnoresItem {
  name?: string
  basePath?: string
  ignores: string[]
}

// Same as `@eslint/config-helpers`: nested arrays and falsy values let users spread presets and write `cond && config`.
export type ConfigInput = FlatConfigItem | ConfigInput[] | false | null | undefined

/** One entry of `extends`. Nested arrays let users pass a whole preset array as a single entry. */
export type ExtendsInput = ExtendsItem | ExtendsInput[]

// Same as ESLint: an extended config can't have `extends` itself, so the expansion stays one level deep.
export type ExtendsItem =
  | Omit<GlobalConfigItem, 'extends'>
  | Omit<ScopedConfigItem, 'extends'>
  | GlobalIgnoresItem

interface ExtendableConfigItem {
  /**
   * Configs this item builds on. Each one is expanded to its own item placed before this one, inheriting this item's `files` and `ignores`.
   */
  extends?: ExtendsInput[]
}

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
