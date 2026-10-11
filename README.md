# Oxlint Flat Config

Compose Oxlint configs from ESLint-style flat config arrays.

Oxlint's config has one root object plus a list of `overrides`, so it is hard to build from reusable pieces. This package lets you write the config as a flat config array, the same way you would with ESLint, and turns it into a config Oxlint understands.

## Install

```bash
pnpm add -D oxlint oxlint-flat-config
```

`oxlint` is a peer dependency, version `1.85.0` or later.

## Usage

Create an `oxlint.config.ts` and export the result of `defineConfig`:

```ts
import { defineConfig, globalIgnores } from 'oxlint-flat-config'

export default defineConfig(
  globalIgnores(['dist', 'coverage']),
  {
    name: 'base',
    plugins: ['typescript', 'unicorn'],
    categories: { correctness: 'error' },
    rules: { 'no-console': 'warn' }
  },
  {
    name: 'tests',
    files: ['**/*.test.ts'],
    rules: { 'no-console': 'off' }
  }
)
```

Config objects apply in order, so a later object overrides an earlier one, just like ESLint. Nested arrays are flattened and falsy values are skipped, so you can spread presets and write `condition && config`.

## Packages

| Package                                               | Description                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| [`oxlint-flat-config`](./packages/oxlint-flat-config) | `defineConfig` and helpers for writing flat configs.               |
| [`@oxlint-flat-config/composer`](./packages/composer) | A chainable API to change configs, for example ones from a preset. |

## Documentation

- [Config objects](./docs/config-objects.md): how each kind of config object turns into Oxlint config.
- [API](./docs/api.md): `defineConfig`, `globalIgnores`, `includeIgnoreFile` and `category`.
- [Composer](./docs/composer.md): the `@oxlint-flat-config/composer` API.
- [Differences from ESLint](./docs/differences-from-eslint.md): what works differently because of Oxlint's config format.

## Credits

- [ESLint](https://github.com/eslint) team creates ESLint flat config, which is the foundation of this entire project.
- [Anthony Fu](https://github.com/antfu) creates [eslint-flat-config-utils](https://github.com/antfu/eslint-flat-config-utils), our `@oxlint-flat-config/composer` is basically an Oxlint version of it.

## License

[MIT](./LICENSE) License © [Liang Mi](https://github.com/liangmiQwQ) and contributors.
