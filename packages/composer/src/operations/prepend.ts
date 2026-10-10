import type { ConfigInput } from 'oxlint-flat-config'

import { resolveConfigs } from '../configs.ts'
import type { Awaitable, Operation } from '../configs.ts'

export function prepend(...inputs: Awaitable<ConfigInput>[]): Operation {
  return async configs => [...(await resolveConfigs(inputs)), ...configs]
}
