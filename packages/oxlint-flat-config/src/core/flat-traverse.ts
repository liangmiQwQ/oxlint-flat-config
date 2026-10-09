type Nested<T> = T | Nested<T>[]

interface FlatEntry<T> {
  /** Where the value sits in the nested input, like `[0][2]`. Used to name unnamed configs, same as ESLint. */
  indexPath: string
  value: T
}

// Ported from ESLint's `@eslint/config-helpers`:
// https://github.com/eslint/rewrite/blob/a413d74c64d3bcc3ce56b831b5c044c3f9ae4b08/packages/config-helpers/src/define-config.js#L289-L309
export function* flatTraverse<T>(list: Nested<T>[], indexPath = ''): Generator<FlatEntry<T>> {
  for (const [i, value] of list.entries()) {
    const valueIndexPath = `${indexPath}[${i}]`

    if (Array.isArray(value)) {
      yield* flatTraverse(value, valueIndexPath)
    } else {
      yield { indexPath: valueIndexPath, value }
    }
  }
}
