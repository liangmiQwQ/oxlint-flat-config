# Contributing Guide

Thank you! We are so excited that you are interested in our project and would like to contribute. Before starting your contribution, please take a moment to read the following tips to save time.

## Before Contributing

Before opening an issue or submitting a pull request, please make sure your problem description is clear and includes necessary steps to reproduce, expected behavior, and actual results.

Please check existing issues and pull requests to avoid duplicates. Use the search function to see if similar topics have been discussed before.

For new feature proposals, please open an Issue or start a Discussion first to gather feedback from maintainers and the community before implementing.

## Setup Project

This project uses [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/). Install the Node.js version in `.node-version`, enable pnpm with `corepack enable`, then install dependencies and Git hooks by running:

```bash
pnpm install
```

You can run formatting and linting checks, build the project and run tests with:

```bash
pnpm run check
pnpm run build
pnpm run test
```

If you have [Vite+](https://viteplus.dev/) installed globally, `vp install` and `vp run <script>` work as well.

## Creating Pull Request

We will review your PR and ensure CI passes (if available)

Before submitting your pull request:

1. Ensure all tests pass
2. Verify code meets linting standards
3. Update documentation if necessary
4. Add tests for new functionality

We typically use squash and merge to keep the commit history clean. Please ensure your PR contains logically grouped changes.

Your PR title should follow [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/), for example:

- `feat: add user authentication`
- `fix: resolve memory leak in data processor`
- `docs: update API documentation`

If your PR hasn't been reviewed within two weeks, please:

- Mention relevant maintainers using `@liangmiQwQ`
- Or contact us at `github@liangmi.dev`

## Possible Follow-up Actions

If reviewers request changes:

1. Convert your PR to a draft: This indicates it's not ready for review
2. Make the requested changes
3. Convert back to "Ready for Review" when done

You can push additional commits to your existing branch - there's no need to create a new pull request. We'll see your updates automatically.

Thank you for contributing! 🎉
