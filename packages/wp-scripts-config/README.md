# @yardinternet/wp-scripts-config

The `@wordpress/scripts` webpack config, with our fixes applied.

## Usage

```diff
-const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
+const defaultConfig = require( '@yardinternet/wp-scripts-config' );
```

## Fixes

### `disable-sass-charset`

Sets `sassOptions.charset = false` so Sass stops emitting a BOM that breaks the concatenated CSS. See [WordPress/gutenberg#81382](https://github.com/WordPress/gutenberg/issues/81382).

## Adding a fix

Drop a module in `src/transforms/` that takes a config and returns it, then add it to the `transforms` array in `src/index.js`.
