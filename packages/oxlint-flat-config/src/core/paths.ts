import path from 'node:path'

import { distribute } from 'glob-distribute'
import type { DistributeResult } from 'glob-distribute'

import type { ExpandedConfigItem } from './extends.ts'
import { isGlobalIgnores } from './global-ignores.ts'
import type { GlobalConfigItem, GlobalIgnoresItem, ScopedConfigItem } from './types.ts'

/** A config item whose patterns follow Oxlint's syntax and are relative to the config file's directory. */
export type OxlintPathItem =
  | Omit<GlobalIgnoresItem, 'basePath'>
  | Omit<GlobalConfigItem, 'extends' | 'basePath'>
  | (Omit<ScopedConfigItem, 'extends' | 'basePath' | 'files'> & { files: string[] })

type MatchedItem = Omit<GlobalConfigItem, 'extends' | 'basePath'> &
  Pick<ScopedConfigItem, 'ignores'>

// TODO: test through `defineConfig` once it returns a config
/**
 * Rewrites ESLint-style `files`, `ignores` and `basePath` into Oxlint-style patterns relative to the config file's directory.
 *
 * - Global ignores become gitignore patterns, for Oxlint's `ignorePatterns`.
 * - Other `files` and `ignores` become fast-glob patterns, for `overrides[].files` and `excludeFiles`.
 */
export function toOxlintPaths(item: ExpandedConfigItem): OxlintPathItem[] {
  const basePath = normalizeBasePath(item.basePath, item.name)

  if (isGlobalIgnores(item)) {
    return [{ ...omitBasePath(item), ignores: item.ignores.map(p => toIgnorePattern(p, basePath)) }]
  }
  if ('files' in item) {
    return matchFiles(omitBasePath(item), item.files, basePath)
  }

  // ESLint applies a config without `files` only inside its `basePath`.
  return basePath ? matchFiles(omitBasePath(item), [[]], basePath) : [omitBasePath(item)]
}

function normalizeBasePath(basePath: string | undefined, name = 'unnamed config'): string {
  if (basePath === undefined) {
    return ''
  }

  // ESLint resolves an absolute `basePath` on its own, but Oxlint needs it relative to the config file's directory, which is unknown here.
  if (path.isAbsolute(basePath)) {
    throw new TypeError(`'basePath' in "${name}" must be relative, received "${basePath}".`)
  }

  const normalized = path.posix.normalize(basePath)
  // Oxlint can't match files outside the config file's directory.
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new TypeError(
      `'basePath' in "${name}" must stay inside the config file's directory, received "${basePath}".`
    )
  }

  return normalized === '.' ? '' : normalized
}

function omitBasePath<T extends { basePath?: string }>(item: T): Omit<T, 'basePath'> {
  const { basePath: _, ...rest } = item
  return rest
}

function matchFiles(
  item: MatchedItem,
  files: ScopedConfigItem['files'],
  basePath: string
): OxlintPathItem[] {
  const { ignores = [], ...rest } = item
  const excludeFiles = ignores.map(pattern => toExcludePattern(pattern, basePath, item.name))

  // 1. Turn every `files` entry into one AND group. ESLint never matches files outside `basePath`.
  const groups = files.map(entry => [
    ...(basePath ? [joinBasePath('**', basePath)] : []),
    ...[entry].flat().map(pattern => joinBasePath(pattern, basePath))
  ])

  // 2. Oxlint can't AND patterns, so distribute each group into patterns to include and patterns to exclude.
  const results = groups.map(group => distribute(group)).filter(result => result.include.length > 0)

  // 3. Exclusions apply to the whole override, so only groups with the same exclusions can share one.
  // oxlint-disable-next-line oxc/no-map-spread -- Each override needs its own copy of `rest`.
  return groupByExclude(results).map(({ include, exclude }) => ({
    ...rest,
    files: include.map(toGlobPattern),
    ...(exclude.length + excludeFiles.length > 0 && {
      ignores: [...exclude.map(toGlobPattern), ...excludeFiles]
    })
  }))
}

function toExcludePattern(pattern: string, basePath: string, name = 'unnamed config'): string {
  // An ESLint `!` in `ignores` re-includes files, which Oxlint's `excludeFiles` has no way to express.
  if (pattern.startsWith('!')) {
    throw new TypeError(`Negated pattern "${pattern}" in 'ignores' of "${name}" is not supported.`)
  }
  return toGlobPattern(joinBasePath(pattern, basePath))
}

function groupByExclude(results: DistributeResult[]): DistributeResult[] {
  const groups = new Map<string, DistributeResult>()

  for (const { include, exclude } of results) {
    const key = JSON.stringify(exclude.toSorted())
    const group = groups.get(key)

    if (group) {
      group.include.push(...include)
    } else {
      groups.set(key, { include: [...include], exclude })
    }
  }

  return [...groups.values()]
}

function joinBasePath(pattern: string, basePath: string): string {
  const negation = pattern.startsWith('!') ? '!' : ''
  // `join` also drops a leading `./`, same as ESLint.
  return negation + path.posix.join(basePath, pattern.slice(negation.length))
}

function toGlobPattern(pattern: string): string {
  // Oxlint prefixes a pattern without `/` with `**/`, while ESLint matches it in the base directory only.
  return pattern.includes('/') ? pattern : `./${pattern}`
}

function toIgnorePattern(pattern: string, basePath: string): string {
  // Gitignore matches a pattern without a leading or middle `/` at any depth, so anchor it with a leading `/` like ESLint does.
  return joinBasePath(pattern, `/${basePath}`)
}
