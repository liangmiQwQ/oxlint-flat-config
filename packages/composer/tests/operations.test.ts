import type { OxlintConfig } from 'oxlint'
import type { FlatConfigItem } from 'oxlint-flat-config'
import { expect, it } from 'vite-plus/test'

import { composer } from '../src/index.ts'
import type { Composer } from '../src/index.ts'

const extra: FlatConfigItem = { name: 'extra', files: ['extra/**'], rules: { 'no-alert': 'error' } }

function base(): Composer {
  return composer(
    { name: 'a', files: ['a/**'], rules: { 'no-console': 'error' } },
    { name: 'b', files: ['b/**'], rules: { 'no-debugger': 'error' } }
  )
}

function filesOf(config: OxlintConfig): string[] {
  return config.overrides?.flatMap(override => override.files) ?? []
}

it.each([
  ['append', base().append(extra), ['a/**', 'b/**', 'extra/**']],
  ['prepend', base().prepend(extra), ['extra/**', 'a/**', 'b/**']],
  ['insertBefore', base().insertBefore('b', extra), ['a/**', 'extra/**', 'b/**']],
  ['insertAfter', base().insertAfter('a', extra), ['a/**', 'extra/**', 'b/**']],
  ['replace', base().replace('a', extra), ['extra/**', 'b/**']],
  ['remove', base().remove('a'), ['b/**']]
])('%s places configs in order', async (_, composed, files) => {
  expect(filesOf(await composed)).toEqual(files)
})

it('override merges an object patch into the named config', async () => {
  const config = await base().override('a', { rules: { 'no-alert': 'warn' } })

  expect(config.overrides?.[0].rules).toEqual({ 'no-console': 'error', 'no-alert': 'warn' })
})

it('override replaces the named config with the callback result', async () => {
  const config = await base().override('a', current => ({ files: ['c/**'], rules: current.rules }))

  expect(config.overrides?.[0]).toMatchObject({ files: ['c/**'], rules: { 'no-console': 'error' } })
})

it('overrideRules only updates configs that already set the rule', async () => {
  const config = await base().overrideRules({ 'no-console': 'warn' })

  expect(config.overrides?.map(override => override.rules)).toEqual([
    { 'no-console': 'warn' },
    { 'no-debugger': 'error' }
  ])
})

it('removeRules removes the rules from every config', async () => {
  const config = await base()
    .append({ files: ['c/**'], rules: { 'no-console': 'off', 'no-alert': 'error' } })
    .removeRules('no-console')

  expect(config.overrides?.map(override => override.rules)).toEqual([
    {},
    { 'no-debugger': 'error' },
    { 'no-alert': 'error' }
  ])
})

it('rejects when the named config does not exist', async () => {
  await expect(base().remove('missing')).rejects.toThrow('Config "missing" is not found')
})

it('keeps the original composer unchanged', async () => {
  const original = base()
  original.remove('a')

  expect(filesOf(await original)).toEqual(['a/**', 'b/**'])
})
