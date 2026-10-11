import type { DummyRuleMap } from 'oxlint'

import { mapRules } from '../configs.ts'
import type { Operation } from '../configs.ts'

// Only updates rules a config already has, so it doesn't turn rules on in configs that never mentioned them.
export function overrideRules(rules: DummyRuleMap): Operation {
  return configs =>
    mapRules(configs, current =>
      Object.fromEntries(
        Object.entries(current).map(([name, entry]) => [
          name,
          Object.hasOwn(rules, name) ? rules[name as keyof DummyRuleMap] : entry
        ])
      )
    )
}
