# Yard Toolkit

Yard Toolkit centralizes configuration files for formatting and linting, among other things.
It is used by the WordPress team for sites and packages.

## Packages

- [@yardinternet/prettier-config](packages/prettier-config/README.md)
- [@yardinternet/eslint-config](packages/eslint-config/README.md)
- [@yardinternet/stylelint-config](packages/stylelint-config/README.md)
- [@yardinternet/postcss-config](packages/postcss-config/README.md)
- [@yardinternet/toolkit](packages/toolkit/README.md)

## 👷‍♀️ Package Development

Register package: `npm init -w ./packages/[packagename]`
Install dependencies in package: `npm install [depname] -w [packagename]`

## 🚀 Releasing packages

1. Create a new version for the workspace
```bash
npm version minor --workspace ./packages/prettier-config 
```
2. Publish the workspace to the registry
```bash
npm publish --workspace ./packages/prettier-config
```

### Versioning

```bash
npm version [<newversion> | major | minor | patch ] --workspace ./packages/prettier-config 
```

#### Example

Current version is `1.0.0`. After running `npm version patch` it is `1.0.1` (npm version will automatically commit it to git)

### Publishing

Publish all packages

```bash
npm publish --workspaces
```

Publish one package

```bash
npm publish --workspace ./packages/prettier-config
```

## 🎨 Formatting & Linting

The linting in this monorepo uses the settings defined in the child packages.
Husky (CaptainHook alternative) ensures that all files are automatically formatted and linted with each commit.
