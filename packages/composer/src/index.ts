import type { OxlintConfig } from 'oxlint'
import { defineConfig } from 'oxlint-flat-config'
import type { ConfigInput } from 'oxlint-flat-config'

type Awaitable<T> = T | Promise<T>

// A thenable instead of a Promise, so configs are only resolved when awaited and later util methods can still change them.
export type Composer = PromiseLike<OxlintConfig>

export function composer(...inputs: Awaitable<ConfigInput>[]): Composer {
  return {
    // oxlint-disable-next-line unicorn/no-thenable -- Being awaitable is the point, so users can `export default await composer(...)`.
    then: (onFulfilled, onRejected) =>
      // oxlint-disable-next-line typescript/await-thenable -- Promise.all passes plain values through, so mixing them with promises is fine.
      Promise.all(inputs)
        .then(configs => defineConfig(...configs))
        .then(onFulfilled, onRejected)
  }
}
