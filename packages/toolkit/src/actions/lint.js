import {
	filetypeFromString,
	getGlobByFormatModeAndFiletype,
	modesFromString,
	runCommand,
} from '../utils/helpers.js';
import log from '../utils/logger.js';
import { filetypes } from '../config/filetypes.js';
import { options as configOptions } from '../config/options.js';

export const lint = ( options, filetype, userPath ) => {
	const formatFiletype = filetypeFromString( filetype, true );
	const formatMode = modesFromString( options.mode, true );
	const isFix = options[ configOptions.fix.name ] ?? false;

	let command = {
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

	const glob = getGlobByFormatModeAndFiletype(
		formatMode,
		formatFiletype.name
	);

	const args = [
		...( glob?.path ? [ glob.path ] : [] ),
		...( userPath ? [ userPath ] : [] ),
		...( isFix ? [ '--fix' ] : [] ),
	];

	runCommand( command, args );
};
