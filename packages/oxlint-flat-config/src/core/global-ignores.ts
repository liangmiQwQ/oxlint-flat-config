import type { GlobalIgnoresItem } from './types.ts'

const GLOBAL_IGNORES_KEYS = new Set(['name', 'basePath', 'ignores'])

/** Whether a config item only ignores files globally, same check as ESLint's config array. */
export function isGlobalIgnores(item: object): item is GlobalIgnoresItem {
  return 'ignores' in item && Object.keys(item).every(key => GLOBAL_IGNORES_KEYS.has(key))
}
