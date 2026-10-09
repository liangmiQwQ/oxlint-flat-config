import type { OxlintConfig } from 'oxlint'

import type { ExpandedConfigItem } from './extends.ts'
import { isGlobalIgnores } from './global-ignores.ts'

/** Builds an Oxlint config from flat config items, following their order. */
export function buildOxlintConfig(items: ExpandedConfigItem[]): OxlintConfig {
  let config: OxlintConfig = {}
  for (const item of items) {
    config = addItem(config, item)
  }
  return config
}

function addItem(config: OxlintConfig, item: ExpandedConfigItem): OxlintConfig {
  if (isGlobalIgnores(item)) {
    // TODO: append `toIgnorePatterns(item)` to `ignorePatterns`
    return config
  }

  // A config without `files` applies to every file in its `basePath`, which is every file when `basePath` is unset.
  if (!('files' in item) && item.basePath === undefined) {
    // TODO: merge into the root config, while keeping later items winning over earlier overrides
    return config
  }

  // TODO: add one override for each entry of `toOverridePaths(item)`
  return config
}
