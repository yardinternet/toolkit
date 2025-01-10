# @yardinternet/postcss-config

Postcss settings used by the WordPress team.

## Installation

```bash
npm i @yardinternet/postcss-config`
```

## Usage

`@yardinternet/postcss-config` can be required in the `postcss.config.js`

```js
const postcssSettings = require('@yardinternet/postcss-config');

module.exports = postcssSettings();
```

The default path to the styles is `web/app/themes/sage/resources/styles`.
The theme path gets set by the getPathToTheme() function from Yard scripts.
You can change these values by passing the paths as an parameter.

```js
const postcssSettings = require('@yardinternet/postcss-config');
module.exports = postcssSettings('resources/styles', 'src/theme');
```
