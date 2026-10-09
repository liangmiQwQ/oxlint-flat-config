import type { OxlintConfig } from 'oxlint'

import { buildOxlintConfig } from './build.ts'
import { flattenConfigs } from './flatten.ts'
import type { ConfigInput } from './types.ts'

export type * from './types.ts'

export function defineConfig(...configs: ConfigInput[]): OxlintConfig {
  // TODO: return the built config once `buildOxlintConfig` handles every item
  buildOxlintConfig(flattenConfigs(configs))
  throw new Error('Not implemented yet')
}
