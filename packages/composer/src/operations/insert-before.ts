import type { ConfigInput } from 'oxlint-flat-config'

import { findConfigIndex, resolveConfigs } from '../configs.ts'
import type { Awaitable, Operation } from '../configs.ts'

export function insertBefore(name: string, ...inputs: Awaitable<ConfigInput>[]): Operation {
  return async configs => {
    const inserted = await resolveConfigs(inputs)
    return configs.toSpliced(findConfigIndex(configs, name), 0, ...inserted)
  }
}
