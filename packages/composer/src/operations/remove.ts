import { findConfigIndex } from '../configs.ts'
import type { Operation } from '../configs.ts'

export function remove(name: string): Operation {
  return configs => configs.toSpliced(findConfigIndex(configs, name), 1)
}
