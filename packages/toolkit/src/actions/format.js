import {filetypeFromString, getGlobByFormatModeAndFiletype, modesFromString, run} from '../utils/helpers.js';

export const format = ( options, filetypeString, userPath ) => {
	const formatFiletype = filetypeFromString( filetypeString, true );
	const formatMode = modesFromString( options.mode, true );

	const command = 'wp-scripts format';

	const glob = getGlobByFormatModeAndFiletype(formatMode, formatFiletype.name);

	run( `${ command } ${ glob?.path ?? '' } ${ userPath ?? '' }`, 'format' );
};
