import type { OxlintConfig } from 'oxlint'

import { flattenConfigs } from './flatten.ts'
import type { ConfigInput } from './types.ts'

export type * from './types.ts'

export function defineConfig(...configs: ConfigInput[]): OxlintConfig {
  // TODO: transform the flattened items into an `OxlintConfig`
  flattenConfigs(configs)
  throw new Error('Not implemented yet')
}
