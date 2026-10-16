import { defineConfig } from 'oxlint-flat-config/vite-plus'
import type { ConfigInput, UserConfig } from 'oxlint-flat-config/vite-plus'
import type { UserConfig as ViteUserConfig } from 'vite-plus'

import { createComposer } from './composer.ts'
import type { Composer } from './composer.ts'
import type { Awaitable } from './configs.ts'
import { append } from './operations/append.ts'

export type { Composer } from './composer.ts'
export type { ConfigPatch } from './operations/override.ts'

/** A Vite+ config whose `lint` block takes the same inputs as `composer()`. */
export interface ComposerUserConfig extends Omit<UserConfig, 'lint'> {
  lint?: Awaitable<ConfigInput>
}

/** Takes a Vite+ config and runs every step on its `lint` block, resolving to the config `defineConfig` would build. */
export function composer({ lint, ...config }: ComposerUserConfig): Composer<ViteUserConfig> {
  return createComposer([append(lint)], configs => defineConfig({ ...config, lint: configs }))
}
