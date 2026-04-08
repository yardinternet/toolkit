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

TODO: add format scripts
```json
{
  "scripts": {
    "start": "vite build --watch",
    "build": "vite build",
    "test": "vitest",
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
| `autoExternal` | `boolean` | `false` | Auto-externalize dependencies from `package.json`. |
| `wpExternals` | `boolean` | `false` | Adds WordPress externals: `react`, `react-dom`, `@wordpress/element`. |
| `formats` | `Array<'es' \| 'cjs' \| 'umd' \| 'iife'>` | `[ 'es', 'cjs' ]` | Library output formats passed to Vite/Rollup. |
| `fileName` | `(format, entryName) => string` | ``(format, entryName) => `${entryName}.${format}.js` `` | Controls generated entry file naming. |
| `sourcemap` | `boolean \| 'inline' \| 'hidden'` | watch: `'inline'`, build: `false` | Overrides sourcemap behavior per mode. |
| `dts` | `boolean` | auto-detect | Enables declaration output; auto-on when TS entries are detected. |
| `packageJsonValidation` | `boolean` | `true` | Warns when `main`, `module`, or `exports` do not match outputs. |
| `test` | `object` | `{ environment: 'jsdom' }` | Merges Vitest config defaults for package tests. |
| `manifest` | `boolean` | `false` | Enables Vite manifest output (useful for server-side asset resolution). |
| `watch` | `boolean` | auto-detect | Force watch mode on/off; otherwise inferred from `--watch` or `WATCH=true`. |
| `name` | `string` | `undefined` | Optional library name for formats that require a global name. |

Wrapper defaults:

- `npmPackageConfig`: `outDir: 'dist'`, `formats: [ 'es', 'cjs' ]`, `manifest: false`
- `laravelPackageConfig`: `outDir: 'public/build'`, `formats: [ 'es', 'cjs' ]`, `manifest: true`

### Opinionated defaults

| Feature | Watch mode | Build mode |
| --- | --- | --- |
| minify | off | on |
| sourcemap | inline | off by default (configurable) |
| emptyOutDir | false | true |

### Supported package features

- Multi-entry points: object, array, or string input
- Externals: `externals: [ 'react', 'vue' ]`
- Auto externals: `autoExternal: true` reads `dependencies`, `peerDependencies`, and `optionalDependencies`
- WordPress externals preset: `wpExternals: true` adds `react`, `react-dom`, `@wordpress/element`
- File naming consistency through `fileName( format, entryName )`
- TypeScript `.d.ts` generation enabled by default when TS entries are detected
- Asset emission configured for SVG, fonts, and images (`assets/*`)
- Tree-shaking enabled
- Vitest default: `test.environment = 'jsdom'`
- Package metadata validation: warns when `main`, `module`, or `exports` do not match output naming

