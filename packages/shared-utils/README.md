# @yardinternet/shared-utils

Shared utilities used internally by the other toolkit packages. It resolves the
project layout — where the themes live, which theme is the parent, and what URL
the built assets are served from — so every package agrees on one answer.

Ships both formats without a build step: ESM consumers `import`, CommonJS
consumers (eslint, prettier and postcss configs) `require`.

## Usage

```js
import { resolveThemeContext, getAllThemeNames } from '@yardinternet/shared-utils';

const { resolveThemeContext } = require( '@yardinternet/shared-utils' );
```

## Project layout detection

Two layouts are supported:

- **brave-root** — cwd is the project root and themes live in a themes
  directory. Tooling operates on every theme.
- **theme-root** — cwd is a single theme (it has a `style.css` and no themes
  directory). Every path collapses to the cwd, so a theme builds, watches, lints
  and formats on its own.

### Themes directory

Resolved in this order, first hit wins. A candidate only counts when it actually
contains a theme, and `web/app/themes` is probed first, so existing Bedrock
projects resolve exactly as they always did.

1. `themesDir` in `yard-toolkit.config.json`, or in the `yardToolkit` key of
   `package.json`.
2. The `YARD_THEMES_DIR` environment variable.
3. `composer.json` → `extra.installer-paths` entry for `type:wordpress-theme`.
4. A probe of the known layouts: `web/app/themes`, `wp-content/themes`,
   `app/themes`, `public/wp-content/themes`, `content/themes`.
5. A `style.css` in the cwd → theme-root.

Nothing matched throws, listing what was tried.

### Asset base URL

The URL prefix built assets are served from is derived from where the themes
directory sits relative to the WordPress docroot (the nearest ancestor holding
an `index.php` or `wp-config.php`):

| Layout                     | Themes directory     | Asset base URL       |
| -------------------------- | -------------------- | -------------------- |
| Bedrock                    | `web/app/themes`     | `/app/themes`        |
| Classic WordPress          | `wp-content/themes`  | `/wp-content/themes` |

Override with `themesBaseUrl` in the config when a project serves its docroot
from somewhere unusual.

### Parent and child themes

Read from each theme's `style.css` header: a `Template:` field means the theme
is a child of that template, its absence means the theme is a parent. No
configuration involved — this is what WordPress itself uses.

The default theme (the one hosting the dev server, and the target of the
`@sage` compatibility aliases) is picked in this order: the configured
`defaultTheme`, the only parent, a parent named `sage`, then the first parent
alphabetically with a warning.

### Configuration

Only needed when auto-detection cannot get there:

```jsonc
// yard-toolkit.config.json, or the "yardToolkit" key in package.json
{
 "themesDir": "site/wp-content/themes",
 "themesBaseUrl": "/wp-content/themes",
 "defaultTheme": "basis"
}
```

Run `yard-toolkit info` to see what was resolved and which layer won.

## Contents

- `resolveThemeContext( { cwd } )` — the full resolved layout. Memoized per
  directory; throws when nothing resolves.
- `tryResolveThemeContext( { cwd } )` — same, returning `null` instead of
  throwing. Use it in configs loaded by long-lived editor processes.
- `getAllThemeNames()`, `getParentThemes()`, `getThemesBaseUrl()`.
- `clearThemeContextCache()` — for tests.
