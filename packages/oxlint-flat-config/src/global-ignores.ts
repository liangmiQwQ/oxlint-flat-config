export interface GlobalIgnoresConfig {
  name: string
  ignores: string[]
}

// Used to give unnamed global ignores a unique name, same as ESLint's `globalIgnores`.
let globalIgnoreCount = 0

// Ported from ESLint's `@eslint/config-helpers`:
// https://github.com/eslint/rewrite/blob/a413d74c64d3bcc3ce56b831b5c044c3f9ae4b08/packages/config-helpers/src/global-ignores.js#L29-L44
export function globalIgnores(ignorePatterns: string[], name?: string): GlobalIgnoresConfig {
  if (ignorePatterns.length === 0) {
    throw new TypeError('ignorePatterns must contain at least one pattern')
  }

  const id = globalIgnoreCount++

  return {
    // `||` instead of `??` to stay consistent with ESLint, so an empty name also falls back to the generated one.
    // oxlint-disable-next-line typescript/prefer-nullish-coalescing
    name: name || `globalIgnores ${id}`,
    ignores: ignorePatterns
  }
}
