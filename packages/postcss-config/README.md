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

module.exports = postcssSettings(getPathToTheme());
```

The default path to the styles is `web/app/themes/sage/resources/styles`.
You can change this values by passing the paths as an parameter.

```js
const postcssSettings = require('@yardinternet/postcss-config');
module.exports = postcssSettings('src/theme', 'resources/styles');
```
