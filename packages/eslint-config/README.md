# @yardinternet/eslint-config

ESlint settings used by the WordPress team for sites and packages.

## Installation

```bash
npm i @yardinternet/eslint-config
```

## Usage

`@yardinternet/eslint-config` can be required in the `.eslint.config.cjs`

```js
module.exports = require('@yardinternet/eslint-config');
```
You can merge or override rules by spreading this config and adding your own objects:

```js
module.exports = [
    ...require('@yardinternet/eslint-config'),
    {
        rules: {
            // Your overrides here
            "jsdoc/require-param": 0,
        },
    },
];
```
