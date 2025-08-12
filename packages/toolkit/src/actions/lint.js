import {
	filetypeFromString,
	getPathByFormatModeAndFiletype,
	modesFromString,
	runCommandForEveryPath,
} from '../utils/helpers.js';
import log from '../utils/logger.js';
import { filetypes } from '../config/filetypes.js';
import { options as configOptions } from '../config/options.js';

export const lint = ( options, filetype, userPath ) => {
	const formatFiletype = filetypeFromString( filetype, true );
	const formatMode = modesFromString( options.mode, true );
	const isFix = options[ configOptions.fix.name ] ?? false;

	const command = {
		[ filetypes.js.name ]: 'eslint',
		[ filetypes.jsx.name ]: 'eslint',
		[ filetypes.scss.name ]: 'stylelint',
		[ filetypes.css.name ]: 'stylelint',
	}[ formatFiletype.name ];

	if ( ! command ) {
		log.error(
			`Filetype '${ formatFiletype.name }' not supported for linting.`
		);
		return;
	}

	const globs = getPathByFormatModeAndFiletype(
		formatMode,
		formatFiletype.name
	);

	const args = [
		...( userPath ? [ userPath ] : [] ),
		...( isFix ? [ '--fix' ] : [] ),
	];

	runCommandForEveryPath( command, globs, args );
};
