# @yardinternet/vite-config

Vite configuration used by the WordPress team for sites and packages.

## Installation

```bash
npm i @yardinternet/vite-config
```

## Usage

### Brave Theme Vite config

In the `vite.config.js` in the root of your project:

```js
/**
 * External dependencies
 */
import { braveConfig } from '@yardinternet/vite-config';

export default braveConfig( {
 theme: process.env.THEME,
 entryPoints: [
  'resources/scripts/editor/editor.js',
  'resources/scripts/frontend/frontend.js',
  'resources/styles/editor.css',
  'resources/styles/frontend.css'
 ],
} );
```

#### Using Vite `mergeConfig`

You can add extra config to the `braveConfig` by using Vite's `mergeConfig()` function. This is useful for adding custom server settings or plugins.

```js
/**
 * External dependencies
 */
import { defineConfig, mergeConfig } from 'vite';
import { braveConfig } from '@yardinternet/vite-config';

export default mergeConfig(
 braveConfig( {
  theme: process.env.THEME,
  entryPoints: [
  'resources/scripts/editor/editor.js',
  'resources/scripts/frontend/frontend.js',
  'resources/styles/editor.css',
  'resources/styles/frontend.css',
  ],
 } ),
 defineConfig( {
  // Change server settings
  server: {
   hmr: {
    host: 'localhost',
   },
  },
  // Add extra plugins
  plugins: [],
 } )
);
```

### Brave theme blocks Vite config

In the `vite-blocks.config.js` in the root of your block project:

```js
/**
 * External dependencies
 */
import { defineConfig } from 'vite';
import { braveBlocksConfig } from '@yardinternet/vite-config';

export default defineConfig(
 braveBlocksConfig({ blockPath: process.env.BLOCK_PATH })
);
```

## Package Vite configs

Presets for npm and Laravel packages. Both wrappers use `createBasePackageConfig`.

### Scripts in package.json

```json
{
  "scripts": {
    "start": "vite build --watch",
    "build": "vite build",
    "test": "vitest"
  }
}
```

### laravelPackageConfig

```js
import { laravelPackageConfig } from '@yardinternet/vite-config/packages';

export default laravelPackageConfig( {
    entryPoints: {
        index: 'src/index.ts',
    },
} );
```

### npmPackageConfig

Assuming package name is `@yardinternet/gallery`, the config would look like this:

```js
import { npmPackageConfig } from '@yardinternet/vite-config/packages';

export default npmPackageConfig( {
    entryPoints: {
        gallery: 'src/index.ts',
    },
} );

// or with multiple entry points:
export default npmPackageConfig( {
    entryPoints: {
        frontend: 'src/frontend.ts',
        editor: 'src/editor.ts',
    },
} );
```


#### Reference build files in package.json

Package configs are ESM-only. Use `exports` as the public API for JS entry points and CSS, and add `types` plus `sideEffects` for TypeScript and safe CSS bundling.

Single entry point:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/gallery.js"
    },
    "./styles": "./dist/gallery.css"
  },
  "sideEffects": ["**/*.css"]
}
```
This allows consumers to import JS and CSS like this:

```js
import { Gallery } from '@yardinternet/gallery'; // imports gallery.js
import '@yardinternet/gallery/styles'; // imports gallery.css
```
...or import the CSS in CSS:
```css
@import '@yardinternet/gallery/styles'; /* imports gallery.css */
```

Multiple entry points:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/frontend.d.ts",
      "import": "./dist/frontend.js"
    },
    "./editor": {
      "types": "./dist/editor.d.ts",
      "import": "./dist/editor.js"
    },
    "./styles": "./dist/gallery.css"
  },
  "sideEffects": ["**/*.css"]
}
```
This allows consumers to import like this:

```js
import { Gallery } from '@yardinternet/gallery'; // imports frontend.js
import { Editor } from '@yardinternet/gallery/editor'; // imports editor.js
import '@yardinternet/gallery/styles'; // imports frontend.css
```

### All options

Both `npmPackageConfig` and `laravelPackageConfig` pass options through to the shared base package config.

```js
createBasePackageConfig( {
  entryPoints, 
  outDir = 'dist',
  externals = [],
  formats = [ 'es' ],
  fileName = defaultFileName,
  packageJsonValidation = false,
  test = {},
  manifest = false,
  plugins = [],
  externalizeReact = true,
  wordpressGlobals = true,
} )
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `entryPoints` | `Record<string, string> \| string[] \| string` | Required | Entry file(s) for the package build. Supports named object entries (recommended), array entries, or a single entry path. |
| `outDir` | `string` | `'dist'` | Build output directory. |
| `externals` | `string[]` | `[]` | Additional Rollup externals that should not be bundled. |
| `formats` | `Array<'es' \| 'cjs' \| 'umd' \| 'iife'>` | `[ 'es' ]` | Vite library output formats. Package preset is ESM. |
| `fileName` | `(format: string, entryName: string) => string` | `defaultFileName` | Controls emitted JS filenames per format and entry. |
| `packageJsonValidation` | `boolean` | `false` | When `true`, validates package.json output fields against configured entries. |
| `test` | `object` | `{}` | Merged into Vitest config. Default test environment is `jsdom`. |
| `manifest` | `boolean \| string` | `false` | Enables Vite manifest generation for Vite Laravel helper (`true` for default path, or a string for custom path). |
| `plugins` | `Array<import('vite').PluginOption>` | `[]` | Extra Vite plugins appended after built-in package plugins. |
| `externalizeReact` | `boolean` | `true` | Externalizes React, ReactDOM, and `react/jsx-runtime` to globals (`React`, `ReactDOM`, `ReactJSXRuntime`). |
| `wordpressGlobals` | `boolean` | `true` | Enables `@roots/vite-plugin` WordPress globals transform for `@wordpress/*` imports. |

Notes:

- All resolved entry files must exist. The config throws if any entry path is missing.
- In watch mode (`WATCH=true` or `vite build --watch`), source maps are inline, minification is disabled, and `emptyOutDir` is disabled to improve iteration.




