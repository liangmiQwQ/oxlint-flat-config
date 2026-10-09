import { expandExtends } from './extends.ts'
import type { ExpandedConfigItem } from './extends.ts'
import { flatTraverse } from './flat-traverse.ts'
import type { ConfigInput } from './types.ts'

// TODO: test through `defineConfig` once it returns a config
/**
 * Flattens nested config arrays, skips falsy values and expands `extends`, same as ESLint's `defineConfig`.
 */
export function flattenConfigs(configs: ConfigInput[]): ExpandedConfigItem[] {
  return [...flatTraverse(configs)].flatMap(({ indexPath, value }) =>
    value ? expandExtends(value, value.name ?? `UserConfig${indexPath}`) : []
  )
}
