# Config Objects

Every object in the array passed to `defineConfig` is one of three kinds. The kind decides where it ends up in the generated Oxlint config.

| Kind           | How to recognize it                    | Becomes                                                                         |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Global ignores | Only has `ignores`, `name`, `basePath` | Entries in `ignorePatterns`                                                     |
| Global config  | Has neither `files` nor `basePath`     | `settings` and `options` in the root, everything else in an override for `**/*` |
| Scoped config  | Has `files`, `basePath` or both        | An entry in `overrides`                                                         |

Oxlint applies every override after the root config. That is why rules from a global config also go into an override instead of the root: it keeps them in the same order as the array.

## Fields

| Field       | Description                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------- |
| `name`      | A label used in error messages and by the [composer](./composer.md) to find the object.       |
| `files`     | Glob patterns the object applies to.                                                          |
| `ignores`   | Glob patterns excluded from the object, or ignored everywhere in a global ignores object.     |
| `basePath`  | The directory `files` and `ignores` are relative to, relative to the config file's directory. |
| `extends`   | Configs placed before this one. See [Extends](#extends).                                      |
| `settings`  | Plugin settings. Global config only.                                                          |
| `options`   | Oxlint options such as `typeAware`. Global config only.                                       |
| `jsPlugins` | ESLint-compatible JS plugins.                                                                 |
| `rules`     | Rule settings.                                                                                |
| `env`       | Environments, such as `browser` or `node`.                                                    |
| `globals`   | Global variables.                                                                             |

Oxlint only reads `settings` and `options` in the root config, so a scoped config can't use them. TypeScript reports this, and `defineConfig` throws if it slips through.

When several global configs set `settings` or `options`, they are merged key by key and the later one wins.

There is no `categories` field, and `defineConfig` throws if one is set. Use [`category()`](./api.md#category) instead.

There is no `plugins` field either. All of Oxlint's built-in plugins are enabled.

## Example

This config:

```ts
import { category, defineConfig, globalIgnores } from 'oxlint-flat-config'

export default defineConfig(
  globalIgnores(['dist', 'coverage']),
  await category({ correctness: 'error', plugins: ['eslint', 'typescript', 'unicorn'] }),
  {
    name: 'base',
    rules: { 'no-console': 'warn' }
  },
  {
    name: 'app',
    basePath: 'packages/app',
    files: ['src/**'],
    ignores: ['src/generated/**'],
    rules: { 'no-debugger': 'error' }
  }
)
```

Turns into:

```json
{
  "categories": { "correctness": "off" },
  "plugins": ["eslint", "import", "jest", "jsdoc"],
  "ignorePatterns": ["/dist", "/coverage"],
  "overrides": [
    {
      "files": ["**/*"],
      "excludeFiles": [],
      "rules": { "eslint/no-debugger": "error" }
    },
    {
      "files": ["**/*"],
      "excludeFiles": [],
      "rules": { "no-console": "warn" }
    },
    {
      "files": ["packages/app/src/**"],
      "excludeFiles": ["packages/app/src/generated/**"],
      "rules": { "no-debugger": "error" }
    }
  ]
}
```

The first override lists every rule in the `correctness` category; only one is shown here. The root `categories` turns off Oxlint's default rules, so only the config objects decide which rules run. The root `plugins` lists every built-in plugin; only some are shown here.

## Patterns

Patterns in `files` and `ignores` are relative to `basePath`, or to the config file's directory when `basePath` is unset. A pattern without a `/`, such as `*.ts`, only matches in that directory, the same as ESLint (**different from Oxlint**).

An entry in `files` can also be an array. A file has to match every pattern in it, which is useful together with `!`:

```ts
// Files in src, except the ones in src/legacy.
{ files: [['src/**', '!src/legacy/**']], rules: { 'no-console': 'error' } }
```

A scoped config with `basePath` but no `files` applies to every file inside `basePath`.

## Global Ignores

An object with only `ignores` (and optionally `name` and `basePath`) ignores files everywhere, like Oxlint's `ignorePatterns`. Use [`globalIgnores`](./api.md#globalignores) to make one and give it a name.

Adding any other field, even `rules`, turns it into an ordinary config where `ignores` only excludes files from that config.

## Extends

`extends` places other configs before the config that uses it. They inherit its `files`, `ignores` and `basePath`:

```ts
{
  files: ['src/**'],
  extends: [{ files: ['**/*.tsx'], rules: { 'react/jsx-key': 'error' } }],
  rules: { 'no-debugger': 'error' }
}
```

Here `react/jsx-key` only applies to files that match both `src/**` and `**/*.tsx`. Global ignores inside `extends` stay global.

An entry of `extends` can be a whole array, so you can pass a preset as one entry. An extended config can't have its own `extends` or `basePath`.
