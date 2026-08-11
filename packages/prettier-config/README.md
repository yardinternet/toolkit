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

## Tailwind config stylesheet

Located automatically at `<theme>/resources/styles/base/config.css`, in both
layouts:

- **brave-root** — the default theme's stylesheet is used as the project-wide
  default, and each theme additionally gets a Prettier `override` pointing at
  its own, so a file is sorted against its own theme's Tailwind config.
- **theme-root** — the theme's own `resources/styles/base/config.css`.

See [project layout detection](../shared-utils/README.md#project-layout-detection)
for how the themes directory and default theme are resolved.

### VSCode

The project root is anchored on this package's own location inside the project's
`node_modules`, which is the only signal that holds up in the VSCode Prettier
extension — the extension host's `process.cwd()` is `/` when the editor is
launched from the Dock, and `VSCODE_CWD` points at whichever directory launched
the editor.

The config is read once per process, so a multi-root workspace resolves a single
project. Reload the window after adding a theme.
