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

### brave-root vs theme-root

`braveConfig` and `braveBlocksConfig` auto-detect where they run:

- **brave-root** — cwd has `web/app/themes/`. Builds every theme; asset base `/app/themes/<theme>/public/build/`.
- **theme-root** — cwd is a single theme (has `style.css`, no `web/app/themes/`). Builds that one theme; output to its own `public/`, asset base `/wp-content/themes/<theme>/public/build/`.

Same config file either way.

## Package Vite configs

Presets for npm and Laravel packages. Both wrappers use `createBasePackageConfig`.

### Scripts in package.json

For `npmPackageConfig`:

```json
{
  "scripts": {
    "start": "vite build --watch",
    "build": "vite build",
    "test": "vitest"
  }
}
```

For `laravelPackageConfig`, the build is driven by the toolkit, which runs one
Vite build per entry. Plain `vite build` throws — it cannot know which entry to
build.

```json
{
  "scripts": {
    "start": "yard-toolkit watch package",
    "build": "yard-toolkit build package",
    "test": "vitest"
  }
}
```

### laravelPackageConfig

```js
import { laravelPackageConfig } from '@yardinternet/vite-config';

export default laravelPackageConfig( {
    entryPoints: {
        index: 'src/index.ts',
    },
} );
```

A package with a JS test suite needs its own `vitest.config.mjs` — Vitest
otherwise falls back to `vite.config.js` and hits the `ENTRY` guard.

### npmPackageConfig

Assuming package name is `@yardinternet/gallery`, the config would look like this:

```js
import { npmPackageConfig } from '@yardinternet/vite-config';

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

`npmPackageConfig` passes options through to the shared base package config.
`laravelPackageConfig` does too, except for the options it always sets itself
and a package cannot override:

- `formats`, `fileName`, `entryPoints`, `build.lib` and
  `build.rollupOptions.output` lock the single-entry IIFE contract, so the
  output stays a plain classic script with no `import`/`export` statements. An
  array-form `build.rollupOptions.output` is discarded, because Vite ignores
  `build.lib.formats` entirely as soon as `output` is an array.
- `outDir` (`public`) and `emptyOutDir` (`false`) are what the toolkit
  orchestrator and the consuming PHP both expect; the orchestrator clears
  `public/` once up front so a per-build wipe would delete sibling entries.
- `dts` is off — nothing loads these bundles as a typed library.

```js
createBasePackageConfig( {
  entryPoints, 
  outDir = 'dist',
  externals = [],
  formats = [ 'es' ],
  fileName = defaultFileName,
  packageJsonValidation = false,
  test = {},
  plugins = [],
  externalizeReact = true,
  wordpressGlobals = true,
  classicJsx = false,
  minify = false,
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
| `plugins` | `Array<import('vite').PluginOption>` | `[]` | Extra Vite plugins appended after built-in package plugins. |
| `externalizeReact` | `boolean` | `true` | Externalizes React, ReactDOM, and `react/jsx-runtime` to globals (`React`, `ReactDOM`, `ReactJSXRuntime`). |
| `wordpressGlobals` | `boolean` | `true` | Enables `@roots/vite-plugin` WordPress globals transform for `@wordpress/*` imports. |
| `classicJsx` | `boolean` | `false` | Uses the classic JSX transform (`React.createElement`) so no `react/jsx-runtime` import is emitted. Needed when the consumer is webpack/`@wordpress/scripts` and only provides `window.React`. |
| `minify` | `boolean` | `false` | Minifies JS and CSS, including whitespace removal. Off in watch mode regardless of this value. |

Any other key is forwarded to Vite as-is and merged over the base config.

### Minification

`minify` is off by default and per preset:

| Preset | `minify` | Why |
| --- | --- | --- |
| `npmPackageConfig` | `false` | The consuming project bundles and minifies the package itself. Readable output keeps its stack traces and build output debuggable, and minifying twice buys nothing. |
| `laravelPackageConfig` | `true` | Built files are served straight to the browser, so nothing downstream minifies them. |

Notes:

- All resolved entry files must exist. The config throws if any entry path is missing.
- In watch mode (`WATCH=true` or `vite build --watch`), source maps are inline, minification is disabled, and `emptyOutDir` is disabled to improve iteration.




