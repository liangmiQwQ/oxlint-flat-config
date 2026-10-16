import { expect, it } from 'vite-plus/test'

import { defineConfig as defineOxlintConfig } from '../src/index.ts'
import { defineConfig } from '../src/vite-plus.ts'
import type { UserConfig, UserConfigExport } from '../src/vite-plus.ts'

const lint = [{ files: ['src/**'], rules: { 'no-console': 'warn' as const } }]
const config: UserConfig = { fmt: { semi: false }, lint }

it.each<[string, UserConfigExport]>([
  ['an object', config],
  ['a promise', Promise.resolve(config)],
  ['a function', () => config]
])('builds the lint block from flat config in %s', async (_, input) => {
  const output = defineConfig(input)
  const resolved = await (typeof output === 'function'
    ? output({ command: 'build', mode: 'production' })
    : output)

  expect(resolved).toMatchObject({ fmt: { semi: false }, lint: defineOxlintConfig(lint) })
})
