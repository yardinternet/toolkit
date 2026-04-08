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

Use package-focused presets for npm and Laravel packages. Both wrappers use `createBasePackageConfig` internally.

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

### npmPackageConfig

```js
import { npmPackageConfig } from '@yardinternet/vite-config/packages';

export default npmPackageConfig( {
    entryPoints: {
        gallery: 'src/gallery.ts',
        slider: 'src/slider.ts',
    },
    outDir: 'dist',
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
      "types": "./dist/src/index.d.ts",
      "import": "./dist/gallery.es.js"
    },
    "./styles": "./dist/gallery.css"
  },
  "types": "./dist/src/index.d.ts",
  "sideEffects": ["**/*.css"]
}
```
This allows consumers to import JS and CSS like this:

```js
import { Gallery } from '@yardinternet/gallery'; // imports gallery.es.js
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
      "types": "./dist/src/index.d.ts",
      "import": "./dist/gallery.es.js"
    },
    "./editor": {
      "import": "./dist/editor.es.js"
    },
    "./styles": "./dist/gallery.css"
  },
  "types": "./dist/src/index.d.ts",
  "sideEffects": ["**/*.css"]
}
```
This allows consumers to import like this:

```js
import { Gallery } from '@yardinternet/gallery'; // imports gallery.es.js
import { Editor } from '@yardinternet/gallery/editor'; // imports editor.es.js
import '@yardinternet/gallery/styles'; // imports gallery.css
```


### laravelPackageConfig

```js
import { laravelPackageConfig } from '@yardinternet/vite-config/packages';

export default laravelPackageConfig( {
    entryPoints: {
        index: 'src/index.ts',
    },
    outDir: 'public/build',
} );
```

### All options

All options below are available on `createBasePackageConfig()` and can also be passed to `npmPackageConfig()` and `laravelPackageConfig()`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `entryPoints` | `string \| string[] \| Record<string, string>` | required | Entry file(s); supports single, array, or named multi-entry map. |
| `outDir` | `string` | `'dist'` | Build output directory. |
| `externals` | `string[]` | `[]` | Packages to exclude from bundle output. |
| `fileName` | `(format, entryName) => string` | ``(format, entryName) => `${entryName}.${format}.js` `` | Controls generated entry file naming. |
| `packageJsonValidation` | `boolean` | `true` | Warns when package `exports` do not match generated output files. |
| `test` | `object` | `{ environment: 'jsdom' }` | Merges Vitest config defaults for package tests. |
| `manifest` | `boolean` | `false` | Enables Vite manifest output (useful for server-side asset resolution). |

