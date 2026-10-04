export interface GlobalIgnoresConfig {
  name: string
  ignores: string[]
}

// Used to give unnamed global ignores a unique name, same as ESLint's `globalIgnores`.
let globalIgnoreCount = 0

export function globalIgnores(ignorePatterns: string[], name?: string): GlobalIgnoresConfig {
  if (!Array.isArray(ignorePatterns)) {
    throw new TypeError('ignorePatterns must be an array')
  }

  if (ignorePatterns.length === 0) {
    throw new Error('ignorePatterns must contain at least one pattern')
  }

  const id = globalIgnoreCount++

  return {
    name: name ?? `globalIgnores ${id}`,
    ignores: ignorePatterns
  }
}
