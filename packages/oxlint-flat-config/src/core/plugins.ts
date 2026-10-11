import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import type { OxlintConfig, OxlintOverride } from 'oxlint'

type Plugin = NonNullable<OxlintConfig['plugins']>[number]

// Rule prefixes Oxlint reads as another built-in plugin, checked after dropping `eslint-plugin-`.
const PLUGIN_ALIASES: Record<string, Plugin> = {
  '@typescript-eslint': 'typescript',
  'typescript-eslint': 'typescript',
  'react-hooks': 'react',
  'import-x': 'import',
  '@next/next': 'nextjs',
  deepscan: 'oxc'
}

// Read from the installed Oxlint, so a new built-in plugin works without updating this list.
const BUILTIN_PLUGINS: ReadonlySet<string> = new Set(loadBuiltinPlugins())

/** Lists the built-in plugins needed by the rules of these overrides, sorted by name. */
export function inferPlugins(overrides: OxlintOverride[]): Plugin[] {
  const ruleNames = overrides.flatMap(override => Object.keys(override.rules ?? {}))
  const plugins = ruleNames.map(toPlugin).filter(plugin => plugin !== undefined)
  return [...new Set(plugins)].toSorted()
}

function toPlugin(ruleName: string): Plugin | undefined {
  const slash = ruleName.lastIndexOf('/')
  // A rule without a prefix, like `no-console`, is an ESLint core rule.
  if (slash === -1) {
    return 'eslint'
  }

  const prefix = ruleName
    .slice(0, slash)
    .replace(/^eslint-plugin-/, '')
    .replaceAll('_', '-')
  const plugin = PLUGIN_ALIASES[prefix] ?? prefix
  // Other prefixes belong to JS plugins, which `jsPlugins` loads instead.
  return isBuiltinPlugin(plugin) ? plugin : undefined
}

function isBuiltinPlugin(name: string): name is Plugin {
  return BUILTIN_PLUGINS.has(name)
}

function loadBuiltinPlugins(): Plugin[] {
  // Resolve Oxlint from this package, which declares it as a peer dependency, so pnpm's strict layout can't hide it.
  const manifestPath = createRequire(import.meta.url).resolve('oxlint/package.json')
  // Oxlint ships its config schema next to the manifest, for `$schema` in `.oxlintrc.json`.
  const schemaPath = path.join(path.dirname(manifestPath), 'configuration_schema.json')
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
  return schema.definitions.LintPluginOptionsSchema.enum
}
