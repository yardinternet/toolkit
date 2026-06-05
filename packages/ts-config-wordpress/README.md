# @yardinternet/ts-config-wordpress

WordPress type dependencies for [`@yardinternet/ts-config`](../ts-config/README.md).

Install this alongside `@yardinternet/ts-config` in Brave (WordPress) projects to get TypeScript types for `@wordpress/*` packages.

## Usage

Install in your Brave project:

```bash
npm install --save-dev @yardinternet/ts-config @yardinternet/ts-config-wordpress
```

No extra configuration needed — TypeScript will pick up the types automatically.

## Why a separate package?

The `@wordpress/*` types are only relevant in WordPress/Brave projects. npm libraries that use `@yardinternet/ts-config` don't need them, so they live here instead.

## Types included

| Package | Source |
|---|---|
| `@wordpress/components` | bundled types |
| `@wordpress/data` | bundled types |
| `@wordpress/dom-ready` | bundled types |
| `@wordpress/editor` | bundled types |
| `@wordpress/element` | bundled types |
| `@wordpress/hooks` | bundled types |
| `@wordpress/i18n` | bundled types |
| `@types/wordpress__block-editor` | DefinitelyTyped |
| `@types/wordpress__blocks` | DefinitelyTyped |
| `@types/wordpress__server-side-render` | DefinitelyTyped |

### Missing types

Some WordPress packages don’t include TypeScript definitions. To verify if a [WordPress package](https://github.com/WordPress/gutenberg/blob/trunk/packages/) provides its own types, check its `package.json` for a "types" field. For those that don’t have a types definition, look for a [corresponding `@types/` package](https://github.com/DefinitelyTyped/DefinitelyTyped/).
