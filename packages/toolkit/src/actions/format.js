import {
	filetypeFromString,
	getPathByFormatModeAndFiletype,
	modesFromString,
	resolveFiles,
	runCommand,
} from '../utils/helpers.js';

export const format = async ( options, filetype, userPath ) => {
	const formatFiletype = filetypeFromString( filetype, true );
	const formatMode = modesFromString( options.mode, true );

	const tool = 'prettier';
	const globs = getPathByFormatModeAndFiletype(
		formatMode,
		formatFiletype.name,
		userPath
	);
	const filesToFormat = await resolveFiles( globs );

	runCommand( tool, filesToFormat, globs, [ '--check', '--write' ] );
};
