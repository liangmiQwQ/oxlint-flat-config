import { mapRules } from '../configs.ts'
import type { Operation } from '../configs.ts'

export function removeRules(...ruleNames: string[]): Operation {
  const removed = new Set(ruleNames)
  return configs =>
    mapRules(configs, rules =>
      Object.fromEntries(Object.entries(rules).filter(([name]) => !removed.has(name)))
    )
}
