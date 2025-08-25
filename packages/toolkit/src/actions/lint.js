import {
	filetypeFromString,
	getPathByFormatModeAndFiletype,
	modesFromString,
	runCommand,
	resolveFiles,
} from '../utils/helpers.js';
import log from '../utils/logger.js';
import { filetypes } from '../config/filetypes.js';
import { options as configOptions } from '../config/options.js';

export const lint = async ( options, filetype, userPath ) => {
	const formatFiletype = filetypeFromString( filetype, true );

	const tool = {
		[ filetypes.js.name ]: 'eslint',
		[ filetypes.scss.name ]: 'stylelint',
		[ filetypes.css.name ]: 'stylelint',
	}[ formatFiletype.name ];

	if ( ! tool ) {
		log.error(
			`Filetype '${ formatFiletype.name }' not supported for linting.`
		);
		return;
	}

	const formatMode = modesFromString( options.mode, true );

	const globs = getPathByFormatModeAndFiletype(
		formatMode,
		formatFiletype.name,
		userPath
	);
	const filesToFormat = await resolveFiles( globs );

	const isFix = options[ configOptions.fix.name ] ?? false;

	runCommand( tool, filesToFormat, globs, [
		...( isFix ? [ '--fix' ] : [] ),
	] );
};
