import type { FlatConfigItem } from 'oxlint-flat-config'

import { findConfigIndex } from '../configs.ts'
import type { Awaitable, Operation } from '../configs.ts'

export type ConfigPatch = FlatConfigItem | ((config: FlatConfigItem) => Awaitable<FlatConfigItem>)

export function override(name: string, patch: ConfigPatch): Operation {
  return async configs => {
    const index = findConfigIndex(configs, name)
    return configs.with(index, await applyPatch(configs[index], patch))
  }
}

// A callback replaces the config, while an object is merged into it.
function applyPatch(config: FlatConfigItem, patch: ConfigPatch): Awaitable<FlatConfigItem> {
  return typeof patch === 'function' ? patch(config) : mergeConfigs(config, patch)
}

// Same as `eslint-flat-config-utils`, arrays are concatenated and records are merged key by key.
function mergeConfigs(config: FlatConfigItem, patch: FlatConfigItem): FlatConfigItem {
  return withoutUndefined({
    ...config,
    ...patch,
    files: concat(config.files, patch.files),
    ignores: concat(config.ignores, patch.ignores),
    extends: concat(config.extends, patch.extends),
    jsPlugins: concat(config.jsPlugins, patch.jsPlugins),
    settings: mergeRecords(config.settings, patch.settings),
    options: mergeRecords(config.options, patch.options),
    rules: mergeRecords(config.rules, patch.rules),
    env: mergeRecords(config.env, patch.env),
    globals: mergeRecords(config.globals, patch.globals)
  }) as FlatConfigItem
}

function concat<T>(base: T[] | undefined, next: T[] | undefined): T[] | undefined {
  return base && next ? [...base, ...next] : (next ?? base)
}

function mergeRecords<T extends object>(base: T | undefined, next: T | undefined): T | undefined {
  return base && next ? { ...base, ...next } : (next ?? base)
}

// `oxlint-flat-config` checks keys with `in`, so a key set to undefined would change how a config is scoped.
function withoutUndefined<T extends object>(object: T): T {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as T
}
