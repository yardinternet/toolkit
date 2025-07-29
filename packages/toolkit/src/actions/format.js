import { spawn } from 'child_process';

import {
	filetypeFromString,
	getGlobByFormatModeAndFiletype,
	modesFromString,
	error,
} from '../utils/helpers.js';

export const format = ( options, filetype, userPath ) => {
	const formatFiletype = filetypeFromString( filetype, true );
	const formatMode = modesFromString( options.mode, true );

	const command = 'prettier';

	const glob = getGlobByFormatModeAndFiletype(
		formatMode,
		formatFiletype.name
	);

	const args = [
		...( glob?.path ? [ glob.path ] : [] ),
		...( userPath ? [ userPath ] : [] ),
		'--check',
		'--write',
	];

	const child = spawn( command, args, {
		stdio: 'inherit',
		shell: true, // required for glob support like {*,**/*}.css
	} );

	child.on( 'exit', ( code ) => {
		if ( code !== 0 ) {
			error( `Prettier exited with code ${ code }` );
		}
	} );
};
