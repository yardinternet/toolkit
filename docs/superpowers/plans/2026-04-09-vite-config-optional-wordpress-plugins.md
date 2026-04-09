# Optional WordPress Plugins in vite-config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `externalizeReact` and `wordpressGlobals` boolean options to `createBasePackageConfig` so each WordPress-specific plugin can be independently disabled.

**Architecture:** Two new optional parameters (defaulting to `true`) are destructured in `createBasePackageConfig`. The plugins array is built conditionally using `&&` short-circuit and filtered with `.filter(Boolean)` to strip falsy entries. No changes to `npmPackageConfig` or `laravelPackageConfig` — both already spread `...options` through.

**Tech Stack:** Vite, vite-plugin-externals, @roots/vite-plugin

---

### Task 1: Add `externalizeReact` and `wordpressGlobals` options to `createBasePackageConfig`

**Files:**
- Modify: `packages/vite-config/src/configs/base-package.js`

- [ ] **Step 1: Add the two new parameters to the destructured options**

In [base-package.js](packages/vite-config/src/configs/base-package.js), update the `createBasePackageConfig` function signature at line 68 from:

```js
export const createBasePackageConfig = ( {
	entryPoints,
	outDir = 'dist',
	externals = [],
	formats = [ 'es' ],
	fileName = defaultFileName,
	packageJsonValidation = false,
	test = {},
	manifest = false,
	plugins = [],
} = {} ) => {
```

to:

```js
export const createBasePackageConfig = ( {
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
} = {} ) => {
```

- [ ] **Step 2: Replace the plugins array to conditionally include the two WordPress plugins**

In the same file, update the `plugins` array inside the returned config (currently lines 112–131) from:

```js
plugins: [
	/**
	 * Externalizes React, ReactDOM and ReactJSXRuntime & reference global versions
	 * provided by WordPress' wp-element (window.React, window.ReactDOM)
	 */
	viteExternalsPlugin( {
		react: 'React',
		'react-dom': 'ReactDOM',
		'react/jsx-runtime': 'ReactJSXRuntime',
	} ),
	/**
	 * Transforms @wordpress/ dependencies to reference window.wp global
	 */
	wordpressPlugin(),
	/**
	 * Generates TypeScript declaration files.
	 */
	dts(),
	...plugins,
],
```

to:

```js
plugins: [
	/**
	 * Externalizes React, ReactDOM and ReactJSXRuntime & reference global versions
	 * provided by WordPress' wp-element (window.React, window.ReactDOM)
	 */
	externalizeReact &&
		viteExternalsPlugin( {
			react: 'React',
			'react-dom': 'ReactDOM',
			'react/jsx-runtime': 'ReactJSXRuntime',
		} ),
	/**
	 * Transforms @wordpress/ dependencies to reference window.wp global
	 */
	wordpressGlobals && wordpressPlugin(),
	/**
	 * Generates TypeScript declaration files.
	 */
	dts(),
	...plugins,
].filter( Boolean ),
```

- [ ] **Step 3: Manually verify the default behavior is unchanged**

Run a quick Node.js smoke test from the repo root to confirm the config resolves without errors and includes both plugins by default:

```bash
node --input-type=module <<'EOF'
import { createBasePackageConfig } from './packages/vite-config/src/configs/base-package.js';

// Create a temp entry file to satisfy the existence check
import fs from 'fs';
fs.writeFileSync('/tmp/test-entry.js', '');

const config = createBasePackageConfig({ entryPoints: '/tmp/test-entry.js' });
const resolved = await config({});

const pluginNames = resolved.plugins.map(p => p?.name ?? p);
console.log('Plugins:', pluginNames);

const hasExternals = pluginNames.some(n => n === 'vite-plugin-externals');
const hasWordpress = pluginNames.some(n => n === 'wordpress-plugin' || typeof n === 'string' && n.includes('wordpress'));
console.assert(hasExternals, 'FAIL: viteExternalsPlugin missing from default config');
console.assert(hasWordpress, 'FAIL: wordpressPlugin missing from default config');
console.log('Default config OK');

fs.unlinkSync('/tmp/test-entry.js');
EOF
```

Expected output includes both plugin names and ends with `Default config OK`.

> Note: If plugin names differ from expected, adjust the `some()` checks — the assertion is that both plugins are present.

- [ ] **Step 4: Manually verify that `externalizeReact: false` removes only the externals plugin**

```bash
node --input-type=module <<'EOF'
import { createBasePackageConfig } from './packages/vite-config/src/configs/base-package.js';
import fs from 'fs';
fs.writeFileSync('/tmp/test-entry.js', '');

const config = createBasePackageConfig({
  entryPoints: '/tmp/test-entry.js',
  externalizeReact: false,
});
const resolved = await config({});

const pluginNames = resolved.plugins.map(p => p?.name ?? p);
console.log('Plugins:', pluginNames);

const hasExternals = pluginNames.some(n => n === 'vite-plugin-externals');
console.assert(!hasExternals, 'FAIL: viteExternalsPlugin should be absent');
console.log('externalizeReact: false OK');

fs.unlinkSync('/tmp/test-entry.js');
EOF
```

Expected: `vite-plugin-externals` is absent from the plugins list.

- [ ] **Step 5: Manually verify that `wordpressGlobals: false` removes only the wordpress plugin**

```bash
node --input-type=module <<'EOF'
import { createBasePackageConfig } from './packages/vite-config/src/configs/base-package.js';
import fs from 'fs';
fs.writeFileSync('/tmp/test-entry.js', '');

const config = createBasePackageConfig({
  entryPoints: '/tmp/test-entry.js',
  wordpressGlobals: false,
});
const resolved = await config({});

const pluginNames = resolved.plugins.map(p => p?.name ?? p);
console.log('Plugins:', pluginNames);

const hasExternals = pluginNames.some(n => n === 'vite-plugin-externals');
console.assert(hasExternals, 'FAIL: viteExternalsPlugin should still be present');
console.log('wordpressGlobals: false OK');

fs.unlinkSync('/tmp/test-entry.js');
EOF
```

Expected: `vite-plugin-externals` is present, wordpress plugin is absent.

- [ ] **Step 6: Commit**

```bash
git add packages/vite-config/src/configs/base-package.js
git commit -m "feat(vite-config): add externalizeReact and wordpressGlobals options"
```
