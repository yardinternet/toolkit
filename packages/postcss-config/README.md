# @yardinternet/postcss-config

Postcss settings used by the WordPress team.

## Installation

```bash
npm i @yardinternet/postcss-config
```

## Usage

`@yardinternet/postcss-config` can be required in the `postcss.config.js`

```js
const { getPathToTheme } = require( './scripts/helpers' );
const postcssSettings = require('@yardinternet/postcss-config');

module.exports = postcssSettings(getPathToTheme(), __dirname);
```

The `@sage` import alias points at the default theme's
`resources/styles`, resolved from the [project
layout](../shared-utils/README.md#project-layout-detection). It falls back to
`web/app/themes/sage/resources/styles` when the layout cannot be resolved.
You can change this value by passing the path as a parameter.

```js
const postcssSettings = require('@yardinternet/postcss-config');
module.exports = postcssSettings('src/theme', __dirname, 'resources/styles');
```
