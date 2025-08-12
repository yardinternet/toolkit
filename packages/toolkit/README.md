# @yardinternet/toolkit

CLI Scripts used by the WordPress team for sites and packages.

## Installation

```bash
npm i @yardinternet/toolkit
```

## Usage

```text
Yard toolkit CLI scripts

Usage

    $ yard-toolkit [action] [filetype] [options] [file/dir/glob ...]

Actions
    format        Runs formatter for specified filetype
    lint          Runs linter for specified filetype
    watch         Runs Vite watcher
    build         Runs Vite build

Filetypes
    js            JavaScript files (*.js)
    blade         Laravel Blade files (*.blade.php)
    css           Cascading Style Sheet files (*.css)
    scss          SCSS files (custom mode only) (*.scss)

Options
    -m, --mode <brave|custom>
                 Glob settings for different types of projects
                 Defaults to 'brave'.
    --no-        Prefix to negate option
                 Example: --no-fix or --no-mode
    -f, --fix
                 Enables auto fix for linter action.
                 Defaults to 'true'.
    --help       Show CLI usage
    --version    Shows version
```

### Format

For default for brave sites:

```bash
yard-toolkit format js
```

For other sites or packages use `custom` mode:

```bash
yard-toolkit format js -m custom './packages/**/*.js'
```

### Lint

For default for brave sites:

```bash
yard-toolkit lint js
```

If you don't want auto fix

```bash
yard-toolkit lint js --no-fix
```

For other sites or packages use `custom` mode:

```bash
yard-toolkit lint js './packages/**/*.js' -m custom --no-fix
```

### Watch

Run Vite watcher for Brave themes:

```bash
yard-toolkit watch themes
```

Run Vite watcher for Brave blocks:

```bash
yard-toolkit watch blocks
```

### Build

Run Vite build for Brave themes:

```bash
yard-toolkit build themes
```

Run Vite build for Brave blocks:

```bash
yard-toolkit build blocks
```

### Example package.json with all scripts

```json
{
 "scripts": {
  "watch": "npm run watch:themes & npm run watch:blocks",
  "watch:themes": "yard-toolkit watch themes",
  "watch:blocks": "yard-toolkit watch blocks",
  "build": "npm run build:themes && npm run build:blocks",
  "build:themes": "yard-toolkit build themes",
  "build:blocks": "yard-toolkit build blocks",
  "lint:css": "yard-toolkit lint css",
  "lint:js": "yard-toolkit lint js",
  "format:css": "yard-toolkit format css",
  "format:js": "yard-toolkit format js",
  "format:blade": "yard-toolkit format blade",
  "start": "npm run watch", // alias 
  "prod-all": "npm run build", // alias
  "yard-toolkit": "yard-toolkit" // needed for Captain Hook to work properly
 },
}
```

## Development

### Add a new action

1. Create an JavaScript file in the [actions](./src/actions) dir. The name of the file must be the name of the action.

```text
actions/format.js
```

2. Create an function export function with the name of your action inside the JS file.
   This function must have the parameters: `options` (object with set [options](./src/config/options.js)), `filetype` (string containing [filetype](./src/config/options.js)), `userPath` (file/dir/glob ... passed by user)

```js
export const format = ( options, filetype, userPath ) => {
    
};
```

3. Add your action to the [actions](./src/config/actions.js) config file.

```js
import { format } from '../actions/format.js';

export const actions = {
    format: {
        name: 'format',
        func: format,
    },
};
```

4. Add a discription of your action to the [help.js](./src/config/help.js) file

```js
// prettier-ignore
export const help = `
Usage

    $ yard-toolkit [action] [filetype] [options] [file/dir/glob ...]

Actions
    ${ actions.format.name }        Runs formatter for specified filetype
```

### Add a new filetype

Go to the [filetypes.js](./src/config/filetypes.js) and add the filetype.
Don't forget to also add it to the [help.js](./src/config/help.js) file.

```js
export const filetypes = {
 blade: {
        name: 'blade',
        extension: '.blade.php',
    },
};
```

### Add a new mode

Go to the [modes.js](./src/config/modes.js) and add the mode.
Don't forget to also add it to the [help.js](./src/config/help.js) file.

The filetype field must link to an name of an filetype in the [filetypes.js](./src/config/filetypes.js) config.

After you added a new mode add the mode to the `choices` list of the option called `mode`

```js
import { filetypes } from './filetypes.js';

export const modes = {
 examplemode: {
  name: 'custom',
        paths: [
            {
                filetype: filetypes.js.name,
                path: [
                    './web/app/themes/**/resources/scripts/**/*.js',
                    './web/app/themes/**/resources/scripts/**/*.jsx',
                ], // filetype with multiple glob paths
            },
            {
                filetype: filetypes.blade.name,
                path: './web/app/themes/**/resources/views/**/*.blade.php',
            }
            // this mode does not have an path for css './web/app/themes/**/resources/styles/**/*.css'
     ],
 },
};
```

```js
import { modes } from './modes.js';

export const options = {
    mode: {
        name: 'mode',
        type: 'string',
        shortFlag: 'm',
        choices: [ modes.brave.name, modes.examplemode.name],
        default: modes.brave.name,
    },
};
```

### Add a new option

Go to the [options.js](./src/config/options.js) and add the option.
Don't forget to also add it to the [help.js](./src/config/help.js) file.

```js
export const options = {
    mode: {
        name: 'mode',
        type: 'string',
        shortFlag: 'm',
        choices: [ modes.brave.name, modes.custom.name ],
        default: modes.brave.name,
    },
    fix: {
        name: 'fix',
        type: 'boolean',
        shortFlag: 'f',
        default: true,
    },
};

```
