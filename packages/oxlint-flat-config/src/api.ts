import { getOxlintPlugins, getRules } from 'get-oxlint-rules'
import type { GetRulesOptions } from 'get-oxlint-rules'
import type { OxlintConfig } from 'oxlint'

import { createCategory } from './category.ts'
import { createPresets } from './configs.ts'
import { buildConfig } from './core/index.ts'
import type { ConfigInput, Plugins } from './core/index.ts'

/**
 * Builds the parts of the API that depend on the installed Oxlint.
 *
 * Each entry passes its own options, so `oxlint-flat-config/vite-plus` reads rules from the Oxlint bundled by Vite+.
 */
export async function createApi(options: GetRulesOptions) {
  // Read from the installed Oxlint, so new built-in rules and plugins work without a release.
  const [rules, plugins] = await Promise.all([
    getRules(options),
    getOxlintPlugins(options) as Promise<Plugins>
  ])
  const category = createCategory(rules)

  return {
    defineConfig: (...configs: ConfigInput[]): OxlintConfig => buildConfig(configs, plugins),
    category,
    ...(await createPresets(category, plugins))
  }
}
