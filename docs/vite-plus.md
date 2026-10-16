# Vite+

[Vite+](https://viteplus.dev) reads its lint config from the `lint` block in `vite.config.ts`. `oxlint-flat-config/vite-plus` lets you write that block as a flat config array.

```bash
pnpm add -D vite-plus oxlint-flat-config
```

You don't need to install `oxlint`. Vite+ ships its own copy, and this entry reads rules and types from it.

## Usage

Import `defineConfig` from `oxlint-flat-config/vite-plus` instead of `vite-plus`:

```ts
import { defineConfig, globalIgnores, recommended } from 'oxlint-flat-config/vite-plus'

export default defineConfig({
  fmt: { semi: false },
  lint: [
    globalIgnores(['dist']),
    recommended,
    { files: ['**/*.test.ts'], rules: { 'no-console': 'off' } }
  ]
})
```

It is Vite+'s own `defineConfig`, except that `lint` takes the same inputs as [`defineConfig`](./api.md#defineconfig) from `oxlint-flat-config`. Every other field is passed to Vite+ unchanged. Like Vite+, it accepts a config object, a promise of one, or a function that returns either.

Everything else in [API](./api.md), like `globalIgnores`, `category`, `recommended` and `all`, is also exported from `oxlint-flat-config/vite-plus`. Import them from there, so the rule lists match the Oxlint that `vp lint` runs.

## Composer

To change a shared preset in the `lint` block, use `composer` from `@oxlint-flat-config/composer/vite-plus`. See [Composer](./composer.md#vite).

## Notes

- Paths in `files`, `ignores` and `basePath` are relative to `vite.config.ts`.
- `vp check` always uses the `lint` block of the workspace root config.
- Vite+ turns off nested lint configs. In a monorepo, use `files` or `basePath` in the root config instead of a `lint` block in each package.
