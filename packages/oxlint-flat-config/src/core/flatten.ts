import { expandExtends } from './extends.ts'
import { flatTraverse } from './flat-traverse.ts'
import type { ConfigInput, ExtendsItem } from './types.ts'

// TODO: test through `defineConfig` once it returns a config
/**
 * Flattens nested config arrays, skips falsy values and expands `extends`, same as ESLint's `defineConfig`.
 */
export function flattenConfigs(configs: ConfigInput[]): ExtendsItem[] {
  return [...flatTraverse(configs)].flatMap(({ indexPath, value }) =>
    value ? expandExtends(value, value.name ?? `UserConfig${indexPath}`) : []
  )
}
