import type { OxlintConfig } from 'oxlint'

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

// TODO: flatten `configs` and transform them into an `OxlintConfig`
// oxlint-disable-next-line no-unused-vars -- Signature is the public API; the body lands in a later PR.
export function defineConfig(...configs: ConfigInput[]): OxlintConfig {
  throw new Error('Not implemented yet')
}
