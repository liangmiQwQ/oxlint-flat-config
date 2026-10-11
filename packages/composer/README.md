# @oxlint-flat-config/composer

Change shared Oxlint flat configs with a chainable API.

When a config comes from a shared preset, you often want to change part of it without copying the whole thing. This package lets you do that with a chain of steps that find config objects by `name`. It builds on [`oxlint-flat-config`](https://github.com/liangmiQwQ/oxlint-flat-config/tree/main/packages/oxlint-flat-config).

## Install

```bash
pnpm add -D oxlint oxlint-flat-config @oxlint-flat-config/composer
```

`oxlint` and `oxlint-flat-config` are both peer dependencies, so the composer uses your project's own copies and there is only ever one `oxlint-flat-config`.

## Usage

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

See [Composer](https://github.com/liangmiQwQ/oxlint-flat-config/blob/main/docs/composer.md) for every method.

## Credits

This package is basically an Oxlint version of [eslint-flat-config-utils](https://github.com/antfu/eslint-flat-config-utils) by [Anthony Fu](https://github.com/antfu).

## License

[MIT](https://github.com/liangmiQwQ/oxlint-flat-config/blob/main/LICENSE) License © [Liang Mi](https://github.com/liangmiQwQ) and contributors.
