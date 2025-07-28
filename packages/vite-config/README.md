# @yardinternet/vite-config

Vite configuration used by the WordPress team for sites and packages.

**To do:**

- Update Vite to 7.0.0 (check all dev dependencies)

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
import { defineConfig } from 'vite';
import { braveConfig } from '@yardinternet/vite-config'; 

export default defineConfig(braveConfig({ theme: process.env.THEME }));
```

#### Extra entry points

Add extra entry points to the `braveConfig` function:

```js
/**
 * External dependencies
 */
import { defineConfig } from 'vite';
import { braveConfig } from '@yardinternet/vite-config'; 

const projectConfig = {
 themes: {
  sage: {
   add: ['styles/admin.css'],
  },
  werkenbij: {
   add: ['styles/admin.css'],
  },
 },
};

const config = braveConfig({ theme: process.env.THEME, projectConfig });

export default defineConfig(config);
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
