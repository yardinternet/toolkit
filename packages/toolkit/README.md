# @yardinternet/scripts

CLI Scripts used by the WordPress team for sites and packages.

## Installation

```bash
npm i @yardinternet/scripts`
```

## Usage

```text
Yard toolkit CLI scripts

Usage

    $ yard-toolkit [action] [filetype] [options] [file/dir/glob ...]

Actions
    format        Runs formatter for specified filetype
    lint          Runs linter for specified filetype

Filetypes
    js            JavaScript files (*.js)
    blade         Laravel Blade files (*.blade.php)
    css           Cascading Style Sheet files (*.css)

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

### Format JavaScript

For default for brave sites:

```bash 
yard-toolkit format js'
```

For other sites or packages use `custom` mode:

```bash 
yard-toolkit format js -m custom './packages/**/*.js'
```
