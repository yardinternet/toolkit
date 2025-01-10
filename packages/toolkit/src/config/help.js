// prettier-ignore
import {actions} from "./actions.js";
import {filetypes} from "./filetypes.js";
import {options} from "./options.js";

export const help = `
Usage

    $ yard-toolkit [action] [filetype] [options] [file/dir/glob ...]

Actions
    ${actions.format.name}        Runs formatter for specified filetype
    ${actions.lint.name}          Runs linter for specified filetype

Filetypes
    ${filetypes.js.name}            JavaScript files (*${filetypes.js.extension})
    ${filetypes.blade.name}         Laravel Blade files (*${filetypes.blade.extension})
    ${filetypes.css.name}           Cascading Style Sheet files (*${filetypes.css.extension})

Options
    -${options.mode.shortFlag}, --${options.mode.name} <${options.mode.choices.join('|')}>
                 Glob settings for different types of projects
                 Defaults to ${options.mode.default}.
    --no-        Prefix to negate option
                 Example: --no-m or --no-mode
    --help       Show CLI usage
    --version    Shows version
`;
