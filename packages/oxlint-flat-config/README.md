# oxlint-flat-config

Compose Oxlint configs from ESLint-style flat config arrays.

Oxlint's config has one root object plus a list of `overrides`, so it is hard to build from reusable pieces. This package lets you write the config as a flat config array, the same way you would with ESLint, and turns it into a config Oxlint understands.

## Install

```bash
pnpm add -D oxlint-flat-config
```

## Usage

Create an `oxlint.config.ts` and export the result of `defineConfig`:

```ts
import { defineConfig, globalIgnores, recommended } from 'oxlint-flat-config'

export default defineConfig(
  globalIgnores(['dist', 'coverage']),
  recommended,
  {
    name: 'base',
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

No rules are on until you configure them. Use `recommended` or `all` to start.

To change part of a shared preset without copying it, see [`@oxlint-flat-config/composer`](https://github.com/liangmiQwQ/oxlint-flat-config/tree/main/packages/composer).

## Documentation

- [Config objects](https://github.com/liangmiQwQ/oxlint-flat-config/blob/main/docs/config-objects.md): how each kind of config object turns into Oxlint config.
- [API](https://github.com/liangmiQwQ/oxlint-flat-config/blob/main/docs/api.md): `defineConfig`, `globalIgnores`, `includeIgnoreFile`, `category`, `recommended` and `all`.
- [Differences from ESLint](https://github.com/liangmiQwQ/oxlint-flat-config/blob/main/docs/differences-from-eslint.md): what works differently because of Oxlint's config format.

## License

[MIT](https://github.com/liangmiQwQ/oxlint-flat-config/blob/main/LICENSE) License © [Liang Mi](https://github.com/liangmiQwQ) and contributors.
