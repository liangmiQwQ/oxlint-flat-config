import { flatTraverse } from './flat-traverse.ts'
import { isGlobalIgnores } from './global-ignores.ts'
import type { ExtendsItem, FlatConfigItem, ScopedConfigItem } from './types.ts'

type Files = ScopedConfigItem['files']

// TODO: test through `defineConfig` once it returns a config
// Ported from ESLint's `@eslint/config-helpers`:
// https://github.com/eslint/rewrite/blob/a413d74c64d3bcc3ce56b831b5c044c3f9ae4b08/packages/config-helpers/src/define-config.js#L376-L469
/**
 * Replaces `extends` with the extended configs, placed before the config itself.
 *
 * The result has no `extends` left, so it has the same shape as `ExtendsItem`.
 */
export function expandExtends(config: FlatConfigItem, configName: string): ExtendsItem[] {
  if (!('extends' in config) || config.extends === undefined) {
    return [config]
  }

  const { extends: extendsList, ...base } = config
  const extended = [...flatTraverse(extendsList)].map(({ indexPath, value }) =>
    extendConfig(base, value, `${configName} > ${value.name ?? `ExtendedConfig${indexPath}`}`)
  )

  // Without `extends`, a config with only `ignores` would turn into a global ignore, so drop it instead.
  return isGlobalIgnores(base) ? extended : [...extended, base]
}

function extendConfig(base: ExtendsItem, extension: ExtendsItem, name: string): ExtendsItem {
  if ('extends' in extension) {
    throw new TypeError(`Nested 'extends' is not allowed in "${name}".`)
  }

  // Global ignores apply everywhere, so they don't inherit `files` or `ignores`.
  if (isGlobalIgnores(extension)) {
    return { ...extension, name }
  }

  return {
    ...extension,
    name,
    ...('files' in base && { files: extendFiles(base.files, extension) }),
    ...('ignores' in base &&
      base.ignores && { ignores: [...base.ignores, ...getIgnores(extension)] })
  }
}

function getIgnores(item: ExtendsItem): string[] {
  return 'ignores' in item ? (item.ignores ?? []) : []
}

function extendFiles(baseFiles: Files, extension: ExtendsItem): Files {
  const extensionFiles = 'files' in extension ? extension.files : []

  // Same as ESLint, an empty side doesn't narrow the other one.
  if (extensionFiles.length === 0) {
    return baseFiles
  }
  if (baseFiles.length === 0) {
    return extensionFiles
  }

  // A file must match both, so pair every base entry with every extension entry as an AND group.
  return baseFiles.flatMap(baseEntry =>
    extensionFiles.map(extensionEntry => [baseEntry, extensionEntry].flat())
  )
}
