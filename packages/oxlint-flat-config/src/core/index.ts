import type { OxlintConfig } from 'oxlint'

import { buildOxlintConfig } from './build.ts'
import type { Plugins } from './build.ts'
import { flattenConfigs } from './flatten.ts'
import type { ConfigInput } from './types.ts'

export type {
  ConfigInput,
  ExtendsInput,
  ExtendsItem,
  FlatConfigItem,
  GlobalConfigItem,
  GlobalIgnoresItem,
  ScopedConfigItem
} from './types.ts'

export type { Plugins } from './build.ts'

/** Builds an Oxlint config from flat config inputs, enabling the given built-in plugins. */
export function buildConfig(configs: ConfigInput[], plugins: Plugins): OxlintConfig {
  return buildOxlintConfig(flattenConfigs(configs), plugins)
}
