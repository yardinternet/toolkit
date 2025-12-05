# Yard Toolkit

Yard Toolkit centralizes configuration files for building, formatting and linting, among other things.
It is used by the WordPress team for sites and packages.

## Packages

- [@yardinternet/prettier-config](packages/prettier-config/README.md)
- [@yardinternet/eslint-config](packages/eslint-config/README.md)
- [@yardinternet/stylelint-config](packages/stylelint-config/README.md)
- [@yardinternet/postcss-config](packages/postcss-config/README.md)
- [@yardinternet/toolkit](packages/toolkit/README.md)
- [@yardinternet/vite-config](packages/vite-config/README.md)

## 👷‍♀️ Package Development

Register package: `npm init -w ./packages/[packagename]`
Install dependencies in package: `npm install [depname] -w ./packages/[packagename]`

> ℹ️ **Note on pnpm**  
> The `./packages/toolkit` package requires *all* dependencies from all used configs/packages to be explicitly declared. Unlike npm, pnpm does not automatically hoist undeclared dependencies. More details in the [README of the toolkit package](./packages/toolkit/README.md#note-on-dependencies).

## 🚀 Releasing packages

```bash
lerna publish --no-private
```

## 📦 Dependency Management

```bash
npm run dep:check     # List mismatched versions across workspaces
npm run dep:fix       # Fix mismatched versions
npm run dep:outdated  # Check for outdated dependencies across workspaces
npm run dep:update    # Update all dependencies and reinstall
```

## 🎨 Formatting & Linting

The linting in this monorepo uses the settings defined in the child packages.
Husky (CaptainHook alternative) ensures that all files are automatically formatted and linted with each commit.

## About us

[![banner](https://raw.githubusercontent.com/yardinternet/.github/refs/heads/main/profile/assets/small-banner-github.svg)](https://www.yard.nl/werken-bij/)
