# API

Everything on this page is exported from `oxlint-flat-config`.

## `defineConfig`

```ts
function defineConfig(...configs: ConfigInput[]): OxlintConfig
```

Builds an Oxlint config from flat config objects. Each argument can be a config object, a nested array of them, or a falsy value, which is skipped.

```ts
import { defineConfig } from 'oxlint-flat-config'
import preset from 'some-preset'

export default defineConfig(
  preset,
  process.env.CI && { rules: { 'no-console': 'error' } }
)
```

See [Config objects](./config-objects.md) for how each object is turned into Oxlint config.

## `globalIgnores`

```ts
function globalIgnores(ignorePatterns: string[], name?: string): GlobalIgnoresItem
```

Makes a config object that ignores files everywhere. Without `name`, it gets a unique name like `globalIgnores 0`. Throws if `ignorePatterns` is empty.

```ts
import { defineConfig, globalIgnores } from 'oxlint-flat-config'

export default defineConfig(globalIgnores(['dist', 'coverage'], 'build output'))
```

## `includeIgnoreFile`

```ts
function includeIgnoreFile(
  ignoreFilePath: string,
  options?: { name?: string } | string
): GlobalIgnoresItem
function includeIgnoreFile(
  ignoreFilePaths: string[],
  options?: { name?: string } | string
): GlobalIgnoresItem[]
```

Reads a gitignore-style file and turns its patterns into a global ignores object. The path must be absolute. With an array of paths, it returns one object per file.

The default name is `Imported .gitignore patterns`. Passing the name as a string is also accepted, for compatibility with `@eslint/compat`.

```ts
import path from 'node:path'

import { defineConfig, includeIgnoreFile } from 'oxlint-flat-config'

export default defineConfig(includeIgnoreFile(path.resolve(import.meta.dirname, '.prettierignore')))
```

Oxlint already skips files listed in `.gitignore`, so you usually only need this for other ignore files.

## `category`

```ts
async function category(
  categories: RuleCategories,
  options?: {
    name?: string
    plugins?: OxlintConfig['plugins']
    files?: (string | string[])[]
    ignores?: string[]
  }
): Promise<FlatConfigItem>
```

Turns Oxlint rule categories into a config object that sets every rule in them explicitly.

Oxlint's own `categories` field applies before every rule, wherever you set it. A `category()` object follows the array order instead: later objects override it, and it overrides earlier ones.

```ts
import { category, defineConfig } from 'oxlint-flat-config'
import preset from 'some-preset'

export default defineConfig(
  preset,
  // Every correctness rule is an error, even the ones the preset turned off.
  await category({ correctness: 'error' }),
  await category({ style: 'warn' }, { files: ['src/**'] }),
  await category({ correctness: 'error' }, { files: ['**/*.tsx'], plugins: ['react', 'jsx-a11y'] })
)
```

`plugins` picks which plugins' rules are included. It defaults to Oxlint's default plugins: `eslint`, `typescript`, `unicorn` and `oxc`. The object also enables those plugins, because Oxlint ignores an override's rules when their plugin is only enabled by another override ([oxc-project/oxc#27259](https://github.com/oxc-project/oxc/issues/27259)).

Pass `files` to scope it, and `ignores` to exclude files from that scope. The default name lists the categories, like `category correctness, perf`. The result can also be used in `extends`.

`category` runs the installed `oxlint` to get the rule list, so it is async. The list is loaded once and shared by every call.

## Types

| Type                | Description                                                                    |
| ------------------- | ------------------------------------------------------------------------------ |
| `ConfigInput`       | What `defineConfig` accepts: a config object, a nested array or a falsy value. |
| `FlatConfigItem`    | One config object of any kind.                                                 |
| `GlobalConfigItem`  | A config object without `files`, `basePath` or `ignores`.                      |
| `ScopedConfigItem`  | A config object with `files` or `basePath`.                                    |
| `GlobalIgnoresItem` | A config object with only `ignores`, `name` and `basePath`.                    |
| `ExtendsInput`      | One entry of `extends`: a config object or a nested array.                     |
| `ExtendsItem`       | A config object allowed in `extends`.                                          |
