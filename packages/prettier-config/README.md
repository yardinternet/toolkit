# @yardinternet/prettier-config

Prettier settings used by the WordPress team for sites and packages.

## Installation

```bash
npm i @yardinternet/prettier-config`
```

## Usage

`@yardinternet/prettier-config` can be required in the `.prettierrc.js`

```js
export { default } from '@yardinternet/prettier-config';
```

If you want to add or override settings you can use tools like [deepmerge](https://www.npmjs.com/package/@bundled-es-modules/deepmerge).


```js
import merge from '@bundled-es-modules/deepmerge';
import prettierConfig from '@yardinternet/prettier-config';

export default merge(prettierConfig, {
    overrides: [
        {
            files: ['*.js'],
            options: { singleQuote: false },
        }
    ],
});
```
