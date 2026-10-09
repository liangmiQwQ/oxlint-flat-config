import path from 'node:path'

import { distribute } from 'glob-distribute'
import type { DistributeResult } from 'glob-distribute'

import type { GlobalIgnoresItem, ScopedConfigItem } from './types.ts'

/** The path fields of a config item. A config item without `files` applies to every file in its `basePath`. */
type PathFields = Pick<ScopedConfigItem, 'name' | 'basePath' | 'ignores'> &
  Partial<Pick<ScopedConfigItem, 'files'>>

/** Patterns for one Oxlint override, relative to the config file's directory. */
export interface OverridePaths {
  files: string[]
  excludeFiles: string[]
}

// TODO: test through `defineConfig` once it returns a config
/** Converts global ignores into gitignore patterns for Oxlint's `ignorePatterns`. */
export function toIgnorePatterns(item: GlobalIgnoresItem): string[] {
  const basePath = normalizeBasePath(item)
  return item.ignores.map(pattern => toIgnorePattern(pattern, basePath))
}

// TODO: test through `defineConfig` once it returns a config
/**
 * Converts `files`, `ignores` and `basePath` into fast-glob patterns for Oxlint's `overrides`.
 *
 * Usually returns one entry. AND groups in `files` can need more, since their exclusions apply to the whole override.
 */
export function toOverridePaths(item: PathFields): OverridePaths[] {
  const basePath = normalizeBasePath(item)
  const ignores = (item.ignores ?? []).map(pattern =>
    toExcludePattern(pattern, basePath, item.name)
  )

  // 1. Turn every `files` entry into one AND group. ESLint never matches files outside `basePath`.
  const scope = basePath ? [joinBasePath('**', basePath)] : []
  // oxlint-disable-next-line oxc/no-map-spread -- A group has only a few patterns, and spreading reads clearer than `concat`.
  const groups = (item.files ?? [[]]).map(entry => [
    ...scope,
    ...[entry].flat().map(pattern => joinBasePath(pattern, basePath))
  ])

  // 2. Oxlint can't AND patterns, so distribute each group into patterns to include and patterns to exclude.
  const results = groups.map(group => distribute(group)).filter(result => result.include.length > 0)

  // 3. Only groups with the same exclusions can share an override.
  return groupByExclude(results).map(({ include, exclude }) => ({
    files: include.map(toGlobPattern),
    excludeFiles: [...exclude.map(toGlobPattern), ...ignores]
  }))
}

function normalizeBasePath({ basePath, name = 'unnamed config' }: PathFields): string {
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
