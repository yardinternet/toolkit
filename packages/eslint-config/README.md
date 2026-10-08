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

## Import aliases

Every theme gets an `@<theme>/scripts` alias pointing at its own
`resources/scripts`, in both layouts:

- **brave-root** — cwd is the project root; aliases resolve per theme, e.g. `@sage/scripts` → `web/app/themes/sage/resources/scripts`.
- **theme-root** — cwd is a single theme (has `style.css`, no themes directory); `@<theme>/scripts` → `./resources/scripts`.

`@sage/scripts` is always available: in projects without a theme named `sage` it
falls back to the default theme, so shared starter code keeps resolving. See
[project layout detection](../shared-utils/README.md#project-layout-detection).
