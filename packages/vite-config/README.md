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


### laravelPackageConfig

```js
import { laravelPackageConfig } from '@yardinternet/vite-config/packages';

export default laravelPackageConfig( {
    entryPoints: {
        index: 'src/index.ts',
    },
} );
```

### All options


