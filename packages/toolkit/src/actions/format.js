import { filetypeFromString, modesFromString, run } from '../utils/helpers.js';

export const format = ( options, filetypeString, userPath ) => {
	const formatFiletype = filetypeFromString( filetypeString, true );
	const formatMode = modesFromString( options.mode, true );

	const command = 'wp-scripts format';

	const glob = formatMode.paths?.find(
		( path ) => path.filetype === formatFiletype.name
	);

	run( `${ command } ${ glob?.path ?? '' } ${ userPath ?? '' }`, 'format' );
};
