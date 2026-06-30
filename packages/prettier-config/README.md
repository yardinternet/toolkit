# @yardinternet/prettier-config

Prettier settings used by the WordPress team for sites and packages.

## Installation

```bash
npm i @yardinternet/prettier-config
```

## Usage

`@yardinternet/prettier-config` can be required in the `.prettierrc.js`

```js
module.exports = require('@yardinternet/prettier-config');
```

If you want to add or override settings you can use tools like [deepmerge](https://www.npmjs.com/package/deepmerge).

```js
const merge = require('deepmerge');
const prettierSettings = merge(require('@yardinternet/prettier-config'), {
    overrides: [
        {
            files: ['*.ts'],
            options: {
                singleQuote: true,
            }
        }
    ]
})
module.exports = prettierSettings;
```

## brave-root vs theme-root

The Tailwind config stylesheet is located automatically, trying both layouts:

- **brave-root** — `web/app/themes/sage/resources/styles/base/config.css`.
- **theme-root** — the theme's own `resources/styles/base/config.css`.
