import {
	filetypeFromString,
	getPathByFormatModeAndFiletype,
	modesFromString,
	runCommandForEveryPath,
} from '../utils/helpers.js';

export const format = ( options, filetype, userPath ) => {
	const formatFiletype = filetypeFromString( filetype, true );
	const formatMode = modesFromString( options.mode, true );

	const command = 'prettier';
	const globs = getPathByFormatModeAndFiletype(
		formatMode,
		formatFiletype.name,
		userPath
	);

	runCommandForEveryPath( command, globs, [ '--check', '--write' ] );
};
