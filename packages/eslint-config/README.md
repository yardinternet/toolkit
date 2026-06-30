# @yardinternet/eslint-config

ESlint settings used by the WordPress team for sites and packages.

## Installation

```bash
npm i @yardinternet/eslint-config
```

## Usage

`@yardinternet/eslint-config` can be required in the `.eslint.config.js`

```js
module.exports = require('@yardinternet/eslint-config');
```

If you want to add or override settings you can use tools like [deepmerge](https://www.npmjs.com/package/deepmerge).

```js
const merge = require('deepmerge');
const eslintSettings = merge(require('@yardinternet/eslint-config'), [
    {
        rules: {
            "jsdoc/require-param": 0,
        },
    },
])

module.exports = eslintSettings;
```

## brave-root vs theme-root

The `@sage/scripts` import alias auto-detects where ESLint runs:

- **brave-root** — cwd has `web/app/themes/`. `@sage/scripts` → `web/app/themes/sage/resources/scripts`.
- **theme-root** — cwd is a single theme (has `style.css`, no `web/app/themes/`). `@sage/scripts` and `@<theme>/scripts` → `./resources/scripts`.
