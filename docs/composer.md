# Composer

`@oxlint-flat-config/composer` gives you a chainable API to change a list of config objects, for example to adjust a shared preset without copying it.

```bash
pnpm add -D oxlint oxlint-flat-config @oxlint-flat-config/composer
```

`oxlint` and `oxlint-flat-config` are both peer dependencies, so the composer uses your project's own copies and there is only ever one `oxlint-flat-config`.

```ts
import { composer } from '@oxlint-flat-config/composer'
import preset from 'some-preset'

export default await composer(preset)
  .override('preset/typescript', { rules: { 'typescript/no-explicit-any': 'off' } })
  .remove('preset/stylistic')
  .append({ files: ['scripts/**'], rules: { 'no-console': 'off' } })
```

## How It Works

`composer(...inputs)` takes the same inputs as [`defineConfig`](./api.md#defineconfig), and inputs can also be promises. Each method adds one step and returns a new composer. Awaiting the composer runs the steps in order and returns the Oxlint config.

- **Steps run on await.** Nothing is resolved until you `await` the composer, so you can keep chaining before that.
- **Composers are immutable.** Every method returns a new composer, so a base composer can be shared and extended in several ways.
- **Objects are found by `name`.** Methods that take a `name` throw if no object has it, and the error lists the available names. Only top-level objects can be found, not ones inside `extends`.

## Methods

### `append(...inputs)`

Adds config objects to the end.

### `prepend(...inputs)`

Adds config objects to the start.

### `insertBefore(name, ...inputs)`

Adds config objects right before the named object.

### `insertAfter(name, ...inputs)`

Adds config objects right after the named object.

### `replace(name, ...inputs)`

Replaces the named object with the given config objects.

### `remove(name)`

Removes the named object.

### `override(name, patch)`

Changes the named object. `patch` is either an object or a function.

An object is merged into the existing one:

- Arrays (`files`, `ignores`, `extends`, `plugins`, `jsPlugins`) are concatenated.
- Records (`rules`, `settings`, `options`, `env`, `globals`) are merged key by key, the patch winning.
- Other fields, such as `name` and `basePath`, are replaced.

A function receives the existing object and returns the new one, which can be async:

```ts
composer(preset).override('preset/base', config => ({ ...config, files: ['src/**'] }))
```

### `overrideRules(rules)`

Changes rule settings in every object that already sets them. Objects that don't mention a rule are left alone, so this never turns a rule on where it wasn't configured.

```ts
composer(preset).overrideRules({ 'no-console': 'warn' })
```

### `removeRules(...ruleNames)`

Removes the rules from every object that sets them.

Both `overrideRules` and `removeRules` compare rule names as written, so `no-console` doesn't match `eslint/no-console`. [`category()`](./api.md#category) always writes the plugin prefix.
