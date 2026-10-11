import type { DummyRuleMap, RuleCategories } from 'oxlint'

// Keyed by the rule map, so a preset edited by spreading its rules is no longer recognized.
const categoriesByRules = new WeakMap<DummyRuleMap, RuleCategories>()

export function markCategories(rules: DummyRuleMap, categories: RuleCategories): void {
  categoriesByRules.set(rules, categories)
}

export function getCategories(rules: DummyRuleMap | undefined): RuleCategories | undefined {
  return rules && categoriesByRules.get(rules)
}
