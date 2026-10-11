# Differences from ESLint

`oxlint-flat-config` follows ESLint's flat config wherever it can. Some things can't be expressed in Oxlint's config, so they work differently or throw an error.

## Root-Only Fields

Oxlint only reads `settings` and `options` in the root config. A config object with `files` or `basePath` can't set them. In ESLint, `settings` and `languageOptions` can be scoped to files.

## Negated `ignores`

In ESLint, a pattern starting with `!` in `ignores` adds back files that an earlier pattern excluded. Oxlint's overrides have no way to express this, so a negated pattern in the `ignores` of a scoped config throws.

Negated patterns still work in global ignores, and in AND groups in `files`:

```ts
{ files: [['src/**', '!src/legacy/**']], rules: { 'no-console': 'error' } }
```

## Glob Patterns

ESLint matches `files` and `ignores` with [minimatch](https://github.com/isaacs/minimatch). Oxlint matches overrides with [Oxc's fast-glob](https://github.com/oxc-project/fast-glob), a Rust matcher, and `oxlint-flat-config` passes your patterns on to it, so they follow its syntax:

- Extglobs like `+(a|b)` and brace ranges like `{1..3}` are not supported.
- `?` and character classes match one byte instead of one character, so they can behave differently on non-ASCII paths.

The patterns also don't behave exactly like the ones you would write in Oxlint's own config:

- A pattern without a `/`, like `*.ts`, only matches in the base directory, the same as ESLint. Oxlint matches it at any depth, so write `**/*.ts` for that.
- Global ignores become Oxlint's `ignorePatterns`, which use gitignore-style matching instead of fast-glob. They are anchored to the base directory like ESLint, so `dist` only ignores the top-level `dist`, while in a `.gitignore` it would match at any depth. Write `**/dist` for that.

## `basePath`

`basePath` must be a relative path inside the config file's directory. ESLint accepts absolute paths, but Oxlint matches overrides relative to the config file, and it can't match files outside its directory.

## `plugins`

Config objects have no `plugins` field. All of Oxlint's built-in plugins are enabled. Plugins written for ESLint go in `jsPlugins`.

## `extends`

An extended config can't have its own `extends` or `basePath`. It always uses the `basePath` of the config extending it.

## Categories

Oxlint's `categories` field is not part of ESLint, and Oxlint applies it before every rule, wherever it is set. Config objects don't accept it. Use [`category()`](./api.md#category) instead, which follows the array order like other config objects.

## Ignore Files

Oxlint already skips files listed in `.gitignore`, so unlike ESLint you don't need `includeIgnoreFile` for it. `includeIgnoreFile` also needs an absolute path.

## Fields Not Supported

Only the fields listed in [Config objects](./config-objects.md#fields) are supported. ESLint fields such as `languageOptions`, `linterOptions`, `processor` and `language` have no Oxlint counterpart.
