# @yardinternet/ts-config

Centralized TypeScript configs for Yard projects and packages.

## Usage

Brave:

```jsonc
{
 "extends": "@yardinternet/ts-config/tsconfig.brave.json",
}
```

npm or php packages / libraries:

```jsonc
{
 "extends": "@yardinternet/ts-config/tsconfig.library.json",
 "compilerOptions": {
  "outDir": "dist", // Output directory for compiled files
  "rootDir": "src" // Source directory
 },
  "include": ["src/**/*"] // Adjust for the package structure
}
```

## WordPress projects

For Brave (WordPress) projects, also install [`@yardinternet/ts-config-wordpress`](../ts-config-wordpress/README.md) to get `@wordpress/*` type definitions:

```bash
npm install --save-dev @yardinternet/ts-config @yardinternet/ts-config-wordpress
```

