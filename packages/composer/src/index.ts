import { defineConfig } from 'oxlint-flat-config'
import type { ConfigInput } from 'oxlint-flat-config'

import { createComposer } from './composer.ts'
import type { Composer } from './composer.ts'
import type { Awaitable } from './configs.ts'
import { append } from './operations/append.ts'

export type { Composer } from './composer.ts'
export type { ConfigPatch } from './operations/override.ts'

export function composer(...inputs: Awaitable<ConfigInput>[]): Composer {
  return createComposer([append(...inputs)], configs => defineConfig(...configs))
}
