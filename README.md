# Yard Toolkit

Yard Toolkit centralizes configuration files for building, formatting and linting, among other things.
It is used by the WordPress team for sites and packages.

## Packages

- [@yardinternet/prettier-config](packages/prettier-config/README.md)
- [@yardinternet/eslint-config](packages/eslint-config/README.md)
- [@yardinternet/stylelint-config](packages/stylelint-config/README.md)
- [@yardinternet/postcss-config](packages/postcss-config/README.md)
- [@yardinternet/toolkit](packages/toolkit/README.md)
- [@yardinternet/ts-config](packages/ts-config/README.md)
- [@yardinternet/vite-config](packages/vite-config/README.md)

## 👷‍♀️ Package Development

Register package: `pnpm init` (inside `./packages/[packagename]`)
Install dependencies in package: `pnpm --filter [packagename] add [depname]`

> ℹ️ **Note on dependencies**  
> pnpm does not hoist undeclared dependencies. Every package must explicitly declare all its dependencies. More details in the [README of the toolkit package](./packages/toolkit/README.md#note-on-dependencies).

## 🚀 Releasing packages

```bash
lerna publish --no-private
```

## 📦 Dependency Management

```bash
pnpm dep:check     # List mismatched versions across workspaces
pnpm dep:fix       # Fix mismatched versions
pnpm dep:outdated  # Check for outdated dependencies across workspaces
pnpm dep:update    # Update all dependencies
```

## 📝 Testing

```bash
pnpm test
```

Added to catch two types of problems:
- **Dependency updates** silently changing rules
- **Our own config edits** disabling or weakening rules

Each package has two test files:
- `config.snapshot.test.js` — snapshots the full config and fails on a change
- `rules.test.js` / `format.test.js` — behavioral tests that lint/format real code snippets

Tests run on pre-push and in GitHub Actions on every pull request.

## 🎨 Formatting & Linting

The linting in this monorepo uses the settings defined in the child packages. Husky ensures that all files are automatically formatted and linted with each commit.

## About us

[![banner](https://raw.githubusercontent.com/yardinternet/.github/refs/heads/main/profile/assets/small-banner-github.svg)](https://www.yard.nl/werken-bij/)
