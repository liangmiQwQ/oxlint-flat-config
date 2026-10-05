export {
  type ConfigInput,
  defineConfig,
  type FlatConfigItem,
  type GlobalConfigItem,
  type GlobalIgnoresItem,
  type ScopedConfigItem
} from './core/index.ts'
export { globalIgnores } from './global-ignores.ts'
export { includeIgnoreFile, type IncludeIgnoreFileOptions } from './ignore-file.ts'
