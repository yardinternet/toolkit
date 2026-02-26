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

## Dependencies

Our bundler converts `@wordpress/*` packages to externals in the final bundle (e.g., `@wordpress/components` => `wp.components`). With vanilla JavaScript, we didn't need to list them as dependencies. Because TypeScript requires their type definitions, we include them as dependencies in this package.

### Missing types

Some WordPress packages don’t include TypeScript definitions. To verify if a [WordPress package](https://github.com/WordPress/gutenberg/blob/trunk/packages/) provides its own types, check its `package.json` for a "types" field. For those that don't have a types definition, look for a [corresponding `@types/` package](https://github.com/DefinitelyTyped/DefinitelyTyped/).
