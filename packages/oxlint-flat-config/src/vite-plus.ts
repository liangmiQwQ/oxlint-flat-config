import { defineConfig as defineViteConfig } from 'vite-plus'
import type {
  ConfigEnv,
  UserConfig as ViteUserConfig,
  ViteUserConfigExport,
  ViteUserConfigFn
} from 'vite-plus'

import { createApi } from './api.ts'
import type { ConfigInput } from './core/index.ts'

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

/** A Vite+ config whose `lint` block is written as flat config. */
export interface UserConfig extends Omit<ViteUserConfig, 'lint'> {
  lint?: ConfigInput
}

export type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>
export type UserConfigExport = UserConfig | Promise<UserConfig> | UserConfigFn

type DefinedConfig<T extends UserConfigExport> = T extends UserConfigFn
  ? ViteUserConfigFn
  : T extends Promise<UserConfig>
    ? Promise<ViteUserConfig>
    : ViteUserConfig

// `vp lint` runs the Oxlint bundled by Vite+, so read rules from that copy even when the project also installs `oxlint`.
const api = await createApi({ cwd: import.meta.dirname, via: 'vite-plus' })

/**
 * Vite+'s `defineConfig`, with the `lint` block written as flat config.
 *
 * Accepts the same object, promise and function forms as Vite+.
 */
// A single generic signature like Vite+'s, so rule severities in async callbacks stay literal types.
export function defineConfig<T extends UserConfigExport>(config: T): DefinedConfig<T> {
  return defineViteConfig(toViteConfigExport(config)) as DefinedConfig<T>
}

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

function toViteConfigExport(config: UserConfigExport): ViteUserConfigExport {
  if (typeof config === 'function') {
    return (env: ConfigEnv) => toViteConfigAwaitable(config(env))
  }
  return toViteConfigAwaitable(config)
}

function toViteConfigAwaitable(
  config: UserConfig | Promise<UserConfig>
): ViteUserConfig | Promise<ViteUserConfig> {
  return config instanceof Promise ? config.then(toViteConfig) : toViteConfig(config)
}

function toViteConfig({ lint, ...config }: UserConfig): ViteUserConfig {
  return lint === undefined ? config : { ...config, lint: api.defineConfig(lint) }
}
