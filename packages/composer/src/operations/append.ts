import type { ConfigInput } from 'oxlint-flat-config'

import { resolveConfigs } from '../configs.ts'
import type { Awaitable, Operation } from '../configs.ts'

export function append(...inputs: Awaitable<ConfigInput>[]): Operation {
  return async configs => [...configs, ...(await resolveConfigs(inputs))]
}
