# oxlint-flat-config Agent Guide

oxlint-flat-config lets users compose oxlint configs from ESLint-style flat config arrays. It is for projects that use oxlint and want to build their config from reusable pieces, the way ESLint flat configs work.

## Toolchain

Vite+ is used as the project manager and dev toolchain for JavaScript part. Check `node_modules/vite-plus/docs` if you don't know how to use Vite+ features. When you find yourself needing a dev tool a tool is missing, you can check Vite+'s document first.

## Project Layout

This is a pnpm workspace. The published package lives in `packages/oxlint-flat-config`. The root `package.json` is private and only runs workspace scripts.

Vite+ only reads `lint` and `fmt` from the root `vite.config.ts`, so put lint and format changes there. Package configs only set `pack`, `test` and `run`.

## Rules

Keep JavaScript dependency versions in the default catalog in `pnpm-workspace.yaml`, and reference them with `catalog:` in package manifests.

As a opensource project, not all contributors are required to install Vite+ as `vp` globally, so when you are adding a script / task, using `package.json#scripts` to ensure the accessiblility for external contributors.

If you find AGENTS.md is outdated, please notice users to change in response.

Keep code functional. Write simple code that junior developers can understand, and make functions reusable if possible. Use Unix philosophy to design your code (Every function should only do one thing and should not be too long or complex).

Use existing dependencies and tools. Feel free to add dependencies. Don't reinvent the wheel.

Commit messages and PR titles follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Add `.gitkeep` file when creating new empty directory.
