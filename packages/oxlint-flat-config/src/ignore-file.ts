import fs from 'node:fs'
import path from 'node:path'

import type { GlobalIgnoresItem } from './core/types.ts'

export interface IncludeIgnoreFileOptions {
  /** The name to give the output config object(s). */
  name?: string
}

const DEFAULT_NAME = 'Imported .gitignore patterns'

// Ported from ESLint's `@eslint/config-helpers`:
// https://github.com/eslint/rewrite/blob/a413d74c64d3bcc3ce56b831b5c044c3f9ae4b08/packages/config-helpers/src/ignore-file.js
/**
 * Reads a gitignore-style file (e.g. `.gitignore`) and converts its patterns into a flat config object with `ignores`.
 *
 * For Oxlint, it automatically excludes files listed in `.gitignore` by default, so there is usually no need to specify them again.
 */
export function includeIgnoreFile(
  ignoreFilePath: string,
  options?: IncludeIgnoreFileOptions | string
): GlobalIgnoresItem
export function includeIgnoreFile(
  ignoreFilePaths: string[],
  options?: IncludeIgnoreFileOptions | string
): GlobalIgnoresItem[]
export function includeIgnoreFile(
  ignoreFilePathArg: string | string[],
  options?: IncludeIgnoreFileOptions | string
): GlobalIgnoresItem | GlobalIgnoresItem[] {
  const name = parseName(options)

  if (!Array.isArray(ignoreFilePathArg)) {
    return { name, ignores: readIgnorePatterns(ignoreFilePathArg) }
  }

  return ignoreFilePathArg.map((ignoreFilePath, i) => ({
    name: `${name} (${i})`,
    ignores: readIgnorePatterns(ignoreFilePath)
  }))
}

function parseName(options: IncludeIgnoreFileOptions | string | undefined): string {
  // A string option is kept for compatibility with `@eslint/compat`'s `includeIgnoreFile(path, name)`.
  if (typeof options === 'string') {
    return options
  }
  return options?.name ?? DEFAULT_NAME
}

function readIgnorePatterns(ignoreFilePath: string): string[] {
  if (!path.isAbsolute(ignoreFilePath)) {
    throw new Error(`The ignore file location must be an absolute path. Received ${ignoreFilePath}`)
  }

  return fs
    .readFileSync(ignoreFilePath, 'utf8')
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(convertIgnorePatternToMinimatch)
}

function convertIgnorePatternToMinimatch(pattern: string): string {
  const isNegated = pattern.startsWith('!')
  const negatedPrefix = isNegated ? '!' : ''
  const patternToTest = (isNegated ? pattern.slice(1) : pattern).trimEnd()

  if (['', '**', '/**', '**/'].includes(patternToTest)) {
    return `${negatedPrefix}${patternToTest}`
  }

  // A pattern without a slash (or only a trailing one) matches at any depth, like gitignore does.
  const firstIndexOfSlash = patternToTest.indexOf('/')
  const matchEverywherePrefix =
    firstIndexOfSlash === -1 || firstIndexOfSlash === patternToTest.length - 1 ? '**/' : ''

  const patternWithoutLeadingSlash =
    firstIndexOfSlash === 0 ? patternToTest.slice(1) : patternToTest

  // `{` and `(` are literal in gitignore but brace expansion / extglob in minimatch, so escape them.
  const escapedPattern = patternWithoutLeadingSlash.replaceAll(
    /(?=((?:\\.|[^{(])*))\1([{(])/guy,
    String.raw`$1\$2`
  )

  const matchInsideSuffix = patternToTest.endsWith('/**') ? '/*' : ''

  return `${negatedPrefix}${matchEverywherePrefix}${escapedPattern}${matchInsideSuffix}`
}
