import { createApi } from './api.ts'

export type { CategoryOptions, CategorySelection, ScopedCategoryOptions } from './category.ts'
export type {
  ConfigInput,
  ExtendsInput,
  ExtendsItem,
  FlatConfigItem,
  GlobalConfigItem,
  GlobalIgnoresItem,
  ScopedConfigItem
} from './core/index.ts'
export * from './global-ignores.ts'
export * from './ignore-file.ts'

// Resolve Oxlint from this package, which declares it as a peer dependency, so pnpm's strict layout can't hide it.
const api = await createApi({ cwd: import.meta.dirname })

/** Builds an Oxlint config from flat config objects, nested arrays of them and falsy values. */
export const defineConfig = api.defineConfig

/**
 * Turns Oxlint categories into a flat config object with an explicit rule for every rule in them.
 *
 * Unlike oxlint's `categories` field, the result follows flat config order: later config objects override it, and it overrides earlier ones.
 */
export const category = api.category

/** Correctness rules from Oxlint's default plugins, reported as errors. */
export const recommended = api.recommended

/** All built-in rules except nursery rules, matching Oxlint's `all` category. */
export const all = api.all
