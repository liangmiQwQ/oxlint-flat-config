import type { DummyRuleMap } from 'oxlint'
import type { ConfigInput, FlatConfigItem } from 'oxlint-flat-config'

export type Awaitable<T> = T | Promise<T>

/** One composer step, turning the config list into the next one. */
export type Operation = (configs: FlatConfigItem[]) => Awaitable<FlatConfigItem[]>

// Flattened up front, so operations can find configs by name no matter how users nest them.
export async function resolveConfigs(inputs: Awaitable<ConfigInput>[]): Promise<FlatConfigItem[]> {
  // oxlint-disable-next-line typescript/await-thenable -- Promise.all passes plain values through, so mixing them with promises is fine.
  return flattenInputs(await Promise.all(inputs))
}

export function findConfigIndex(configs: FlatConfigItem[], name: string): number {
  const index = configs.findIndex(config => config.name === name)
  if (index === -1) {
    const names = configs.flatMap(config => config.name ?? [])
    throw new Error(`Config "${name}" is not found. Available names: ${names.join(', ')}.`)
  }
  return index
}

export function mapRules(
  configs: FlatConfigItem[],
  update: (rules: DummyRuleMap) => DummyRuleMap
): FlatConfigItem[] {
  return configs.map(config => (config.rules ? { ...config, rules: update(config.rules) } : config))
}

function flattenInputs(inputs: ConfigInput[]): FlatConfigItem[] {
  return inputs.flatMap(input => {
    if (Array.isArray(input)) {
      return flattenInputs(input)
    }
    return input ? [input] : []
  })
}
