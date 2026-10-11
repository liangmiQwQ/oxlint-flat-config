import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import type { OxlintConfig } from 'oxlint'

type Plugin = NonNullable<OxlintConfig['plugins']>[number]

// Read from the installed Oxlint, so a new built-in plugin works without updating this list.
export const BUILTIN_PLUGINS: readonly Plugin[] = loadBuiltinPlugins()

function loadBuiltinPlugins(): Plugin[] {
  // Resolve Oxlint from this package, which declares it as a peer dependency, so pnpm's strict layout can't hide it.
  const manifestPath = createRequire(import.meta.url).resolve('oxlint/package.json')
  // Oxlint ships its config schema next to the manifest, for `$schema` in `.oxlintrc.json`.
  const schemaPath = path.join(path.dirname(manifestPath), 'configuration_schema.json')
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
  return schema.definitions.LintPluginOptionsSchema.enum
}
