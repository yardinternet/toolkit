# @yardinternet/stylelint-config

Stylelint settings used by the WordPress team for sites and packages.

## Installation

```bash
npm i @yardinternet/stylelint-config
```

## Usage

`@yardinternet/stylelint-config` can be required in the `.stylelintrc.js`

```js
module.exports = require('@yardinternet/stylelint-config');
```

If you want to add or override settings you can use tools like [deepmerge](https://www.npmjs.com/package/deepmerge).

```js
const merge = require('deepmerge');
const stylelintSettings = merge(require('@yardinternet/stylelint-config'), {
    rules: {
        'media-query-no-invalid': null,
    }
})
module.exports = stylelintSettings;
```
