import { spawn } from 'child_process';

import {
	error,
	filetypeFromString,
	getGlobByFormatModeAndFiletype,
	modesFromString,
} from '../utils/helpers.js';
import { filetypes } from '../config/filetypes.js';
import { options as configOptions } from '../config/options.js';

export const lint = ( options, filetype, userPath ) => {
	const formatFiletype = filetypeFromString( filetype, true );
	const formatMode = modesFromString( options.mode, true );
	const isFix = options[ configOptions.fix.name ] ?? false;

	let command = '';
	switch ( formatFiletype.name ) {
		case filetypes.js.name:
		case filetypes.jsx.name:
			command = 'eslint';
			break;
		case filetypes.scss.name:
		case filetypes.css.name:
			command = 'stylelint';
			break;
		default:
			error(
				`Filetype '${ formatFiletype.name }' not possible with lint action.`
			);
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

	const child = spawn( command, args, {
		stdio: 'inherit',
		shell: true, // Required for glob support
	} );

	child.on( 'exit', ( code ) => {
		if ( code !== 0 ) {
			error( `${ command } exited with code ${ code }` );
		}
	} );
};
