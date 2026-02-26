# @yardinternet/ts-config

Centralized TypeScript configs for Yard projects and packages.

## Usage

Brave:

```jsonc
{
 "extends": "@yardinternet/ts-config/tsconfig.brave.json",
 "include": [
  "web/app/themes/sage/resources/scripts/**/*.ts",
  "web/app/themes/sage/resources/scripts/**/*.tsx",
  "web/app/themes/sage/resources/scripts/**/*.d.ts"
 ]
}
```

npm packages / libraries:

```jsonc
{
 "extends": "@yardinternet/ts-config/tsconfig.library.json",
 "compilerOptions": {
  "outDir": "dist", // Output directory for compiled files
  "rootDir": "src" // Source directory
 },
  "include": ["src/**/*"] // Adjust as needed for the package structure
}
```

## Extending

Override or add options in your own `tsconfig.json` as needed. See comments in each config for rationale.
