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
import { category, defineConfig, globalIgnores } from 'oxlint-flat-config'

export default defineConfig(
  globalIgnores(['dist', 'coverage']),
  await category({ correctness: 'error' }),
  {
    name: 'base',
    plugins: ['typescript', 'unicorn'],
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

## Composer

When a config comes from a shared preset, you often want to change part of it without copying the whole thing. `@oxlint-flat-config/composer` lets you do that with a chain of steps that find config objects by `name`:

```bash
pnpm add -D oxlint oxlint-flat-config @oxlint-flat-config/composer
```

`oxlint` and `oxlint-flat-config` are both peer dependencies, so the composer uses your project's own copies and there is only ever one `oxlint-flat-config`.

```ts
import { composer } from '@oxlint-flat-config/composer'
import preset from 'some-preset'

export default await composer(preset)
  // Merge into one object of the preset.
  .override('preset/typescript', { rules: { 'typescript/no-explicit-any': 'off' } })
  // Drop objects or rules you don't want.
  .remove('preset/stylistic')
  .removeRules('no-alert')
  // Add your own objects at the end, or next to a named one.
  .insertAfter('preset/base', { files: ['*.js'], rules: { 'no-process-exit': 'off' } })
  .append({ files: ['**/*.test.ts'], rules: { 'no-console': 'off' } })
```

`composer()` accepts the same inputs as `defineConfig`, plus promises. The steps run in order when you `await` it, and the result is the same Oxlint config `defineConfig` would build. Every method returns a new composer, so a preset can export a composer and each project can keep chaining on it.

See [Composer](./docs/composer.md) for every method.

## Documentation

- [Config objects](./docs/config-objects.md): how each kind of config object turns into Oxlint config.
- [API](./docs/api.md): `defineConfig`, `globalIgnores`, `includeIgnoreFile` and `category`.
- [Composer](./docs/composer.md): the `@oxlint-flat-config/composer` API.
- [Differences from ESLint](./docs/differences-from-eslint.md): what works differently because of Oxlint's config format.

## Credits

Thanks to [ESLint](https://github.com/eslint) team who creates ESLint flat config, which is the foundation of this entire project.

Thanks to [Anthony Fu](https://github.com/antfu) who creates [eslint-flat-config-utils](https://github.com/antfu/eslint-flat-config-utils), our `@oxlint-flat-config/composer` is basically an Oxlint version of it.

## License

[MIT](./LICENSE) License © [Liang Mi](https://github.com/liangmiQwQ) and contributors.
