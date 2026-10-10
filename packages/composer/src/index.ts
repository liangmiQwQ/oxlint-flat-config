import type { DummyRuleMap, OxlintConfig } from 'oxlint'
import { defineConfig } from 'oxlint-flat-config'
import type { ConfigInput, FlatConfigItem } from 'oxlint-flat-config'

import type { Awaitable, Operation } from './configs.ts'
import { append } from './operations/append.ts'
import { insertAfter } from './operations/insert-after.ts'
import { insertBefore } from './operations/insert-before.ts'
import { overrideRules } from './operations/override-rules.ts'
import { override } from './operations/override.ts'
import type { ConfigPatch } from './operations/override.ts'
import { prepend } from './operations/prepend.ts'
import { removeRules } from './operations/remove-rules.ts'
import { remove } from './operations/remove.ts'
import { replace } from './operations/replace.ts'

export type { ConfigPatch } from './operations/override.ts'

// A thenable instead of a Promise, so configs are only resolved when awaited and later methods can still change them.
export interface Composer extends PromiseLike<OxlintConfig> {
  append: (...inputs: Awaitable<ConfigInput>[]) => Composer
  prepend: (...inputs: Awaitable<ConfigInput>[]) => Composer
  insertBefore: (name: string, ...inputs: Awaitable<ConfigInput>[]) => Composer
  insertAfter: (name: string, ...inputs: Awaitable<ConfigInput>[]) => Composer
  /** Merges the patch into the named config, or replaces it with the callback's result. */
  override: (name: string, patch: ConfigPatch) => Composer
  replace: (name: string, ...inputs: Awaitable<ConfigInput>[]) => Composer
  remove: (name: string) => Composer
  /** Updates rules in every config that already sets them. */
  overrideRules: (rules: DummyRuleMap) => Composer
  removeRules: (...ruleNames: string[]) => Composer
}

export function composer(...inputs: Awaitable<ConfigInput>[]): Composer {
  return createComposer([append(...inputs)])
}

// Each method returns a new composer, so a shared base composer can be reused without being changed.
function createComposer(operations: Operation[]): Composer {
  const chain = (operation: Operation) => createComposer([...operations, operation])

  return {
    // oxlint-disable-next-line unicorn/no-thenable -- Being awaitable is the point, so users can `export default await composer(...)`.
    then: (onFulfilled, onRejected) =>
      runOperations(operations)
        .then(configs => defineConfig(...configs))
        .then(onFulfilled, onRejected),

    append: (...inputs) => chain(append(...inputs)),
    prepend: (...inputs) => chain(prepend(...inputs)),
    insertBefore: (name, ...inputs) => chain(insertBefore(name, ...inputs)),
    insertAfter: (name, ...inputs) => chain(insertAfter(name, ...inputs)),
    override: (name, patch) => chain(override(name, patch)),
    replace: (name, ...inputs) => chain(replace(name, ...inputs)),
    remove: name => chain(remove(name)),
    overrideRules: rules => chain(overrideRules(rules)),
    removeRules: (...ruleNames) => chain(removeRules(...ruleNames))
  }
}

// Operations run in call order, so each one sees the configs left by the previous one.
async function runOperations(operations: Operation[]): Promise<FlatConfigItem[]> {
  let configs: FlatConfigItem[] = []
  for (const operation of operations) {
    configs = await operation(configs)
  }
  return configs
}
