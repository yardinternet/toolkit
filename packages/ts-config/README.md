
# @yardinternet/ts-config

Centralized TypeScript configs for Yard Toolkit monorepo projects.

## Overview
This package provides shared TypeScript configuration for:
- WordPress sites (Sage/Acorn/Bedrock) with TypeScript
- npm packages (TypeScript libraries for WordPress consumption)

## Usage
All config files are standard `tsconfig.json` files (not `.js`).

Install this package in your project, then extend the relevant config using the npm package name:

### For WordPress sites (Sage/Acorn/Bedrock)
```jsonc
{
  "extends": "@yardinternet/ts-config/tsconfig.brave.json"
}
```

### For npm packages
```jsonc
{
  "extends": "@yardinternet/ts-config/tsconfig.library.json"
}
```

## Extending
Override or add options in your own `tsconfig.json` as needed. See comments in each config for rationale.

## Notes
- All configs are designed for use in a pnpm/yarn/npm monorepo.
- Declaration files are only generated for npm packages.
- Adjust paths, includes, and strictness as needed for your project.
