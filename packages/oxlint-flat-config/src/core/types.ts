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
 * Ignores-only objects become global ignore patterns. Other objects become overrides,
 * with root-only fields merged into the root config when no scope is set.
 */
export type FlatConfigItem = ConfigFields & ScopeConstraint

// Scope and root-only fields cannot coexist. Explicit never fields also reject combinations passed through variables.
type ScopeConstraint =
  | Forbidden<'files' | 'basePath'>
  | Forbidden<'categories' | 'settings' | 'options'>

/** Applies to every file and accepts Oxlint's root-only fields. */
export type GlobalConfigItem = ConfigFields & Forbidden<'files' | 'basePath'>

/** Requires files or a base directory; without files, matches every file inside basePath. */
export type ScopedConfigItem = ConfigFields &
  Forbidden<'categories' | 'settings' | 'options'> &
  (Required<Pick<ConfigFields, 'files'>> | Required<Pick<ConfigFields, 'basePath'>>)

/** Only ignore patterns and their metadata; adding rules makes an ordinary config instead. */
export type GlobalIgnoresItem = Pick<ConfigFields, 'name' | 'basePath'> &
  Required<Pick<ConfigFields, 'ignores'>> &
  Forbidden<Exclude<keyof ConfigFields, 'name' | 'basePath' | 'ignores'>>

// Same as `@eslint/config-helpers`: nested arrays and falsy values let users spread presets and write `cond && config`.
export type ConfigInput = FlatConfigItem | ConfigInput[] | false | null | undefined

/** One entry of extends. Nested arrays let users pass a whole preset array as a single entry. */
export type ExtendsInput = ExtendsItem | ExtendsInput[]

// Extensions follow the same scope constraint, but inherit basePath and cannot extend again.
export type ExtendsItem = Omit<ConfigFields, 'extends' | 'basePath'> &
  ScopeConstraint &
  Forbidden<'extends' | 'basePath'>

type Forbidden<Key extends keyof ConfigFields> = Partial<Record<Key, never>>

/** Config fields before validating scope or expanding extends. */
export interface ConfigFields {
  /** A label for this config object, used in error messages and config inspection. */
  name?: string
  /** Glob patterns this config applies to. */
  files?: (string | string[])[]
  /** Glob patterns excluded from this config, or ignored globally in an ignores-only item. */
  ignores?: string[]
  /** The directory files and ignores are relative to, resolved from the config file's directory. */
  basePath?: string
  /** Configs placed before this one, inheriting its file patterns, ignores and base directory. */
  extends?: ExtendsInput[]

  // Oxlint only reads these fields in the root config, not in overrides.
  categories?: RuleCategories
  settings?: OxlintConfig['settings']
  options?: OxlintConfig['options']

  /** Built-in Rust plugins to enable. Overwrites Oxlint's default plugin set. */
  plugins?: OxlintConfig['plugins']
  /** ESLint-compatible JS plugins. */
  jsPlugins?: ExternalPluginEntry[]
  rules?: DummyRuleMap
  env?: OxlintEnv
  globals?: OxlintGlobals
}
