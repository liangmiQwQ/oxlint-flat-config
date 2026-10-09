import type { OxlintConfig } from 'oxlint'

import { flattenConfigs } from './flatten.ts'
import { toOxlintPaths } from './paths.ts'
import type { ConfigInput } from './types.ts'

export type * from './types.ts'

export function defineConfig(...configs: ConfigInput[]): OxlintConfig {
  // TODO: transform the flattened items into an `OxlintConfig`
  flattenConfigs(configs).flatMap(toOxlintPaths)
  throw new Error('Not implemented yet')
}
