import {
	filetypeFromString,
	getGlobByFormatModeAndFiletype,
	modesFromString,
	runCommand,
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
	runCommand( command, args );
};
