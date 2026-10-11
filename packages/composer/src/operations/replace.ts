import type { ConfigInput } from 'oxlint-flat-config'

import { findConfigIndex, resolveConfigs } from '../configs.ts'
import type { Awaitable, Operation } from '../configs.ts'

export function replace(name: string, ...inputs: Awaitable<ConfigInput>[]): Operation {
  return async configs => {
    const replacements = await resolveConfigs(inputs)
    return configs.toSpliced(findConfigIndex(configs, name), 1, ...replacements)
  }
}
