import type { OxlintConfig } from 'oxlint'

import { buildOxlintConfig } from './build.ts'
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

export function defineConfig(...configs: ConfigInput[]): OxlintConfig {
  return buildOxlintConfig(flattenConfigs(configs))
}
