import { actions } from './actions.js';
import { filetypes } from './filetypes.js';
import { options } from './options.js';

// prettier-ignore
export const help = `
Usage

    $ yard-toolkit [action] [filetype] [options] [file/dir/glob ...]

Actions
    ${ actions.format.name }        Runs formatter for specified filetype
    ${ actions.lint.name }          Runs linter for specified filetype
    ${ actions.watch.name }         Runs Vite watcher
    ${ actions.build.name }         Runs Vite build

Filetypes
    ${ filetypes.js.name }            JavaScript files (*${
		filetypes.js.extension
	})
    ${ filetypes.jsx.name }           JSX files (*${
		filetypes.jsx.extension
	})
    ${ filetypes.blade.name }         Laravel Blade files (*${
		filetypes.blade.extension
	})
    ${ filetypes.css.name }           Cascading Style Sheet files (*${
		filetypes.css.extension
	})
    ${ filetypes.scss.name }          SCSS files (custom mode only) (*${
		filetypes.scss.extension
	})

Options
    -${ options.mode.shortFlag }, --${
		options.mode.name
	} <${ options.mode.choices.join( '|' ) }>
                 Glob settings for different types of projects
                 Defaults to '${ options.mode.default }'.
    --no-        Prefix to negate option
                 Example: --no-fix or --no-mode
    -${ options.fix.shortFlag }, --${
		options.fix.name
    }
                 Enables auto fix for linter action.
                 Defaults to '${ options.fix.default }'.
    --help       Show CLI usage
    --version    Shows version
`;
