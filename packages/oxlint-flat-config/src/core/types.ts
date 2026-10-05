import type { OxlintConfig, OxlintOverride } from 'oxlint'

/**
 * One ESLint-style flat config object.
 *
 * How it maps onto `OxlintConfig`:
 * - only `ignores` (plus optional `name`): a global ignore, goes into `ignorePatterns`
 * - no `files`: merged into the root config
 * - with `files`: becomes an `overrides` entry, where `ignores` becomes `excludeFiles`
 *
 * `categories`, `settings` and `options` are root-only in oxlint, so they are rejected when `files` is set.
 */
export interface FlatConfigItem
  extends
    Omit<OxlintOverride, 'files' | 'excludeFiles'>,
    Pick<OxlintConfig, 'categories' | 'settings' | 'options'> {
  name?: string
  files?: string[]
  ignores?: string[]
}

/** The `{ name, ignores }` shape produced by `globalIgnores` and `includeIgnoreFile`. */
export type GlobalIgnoresItem = Required<Pick<FlatConfigItem, 'name' | 'ignores'>>

// Same as `@eslint/config-helpers`: nested arrays and falsy values let users spread presets and write `cond && config`.
export type ConfigInput = FlatConfigItem | ConfigInput[] | false | null | undefined
