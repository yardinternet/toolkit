import {error, filetypeFromString, getGlobByFormatModeAndFiletype, modesFromString, run} from "../utils/helpers.js";

export const lint = ( options, filetype, userPath ) => {
	const formatFiletype = filetypeFromString( filetypeString, true );
	const formatMode = modesFromString( options.mode, true );

	const command = 'wp-scripts';
	let commandAction = '';

	switch (formatFiletype.name) {
		case formatFiletype.js.name:
			commandAction = 'lint-js';
			break;
		case formatFiletype.css.name:
			commandAction = 'lint-style';
			break;
		default:
			error(`Filetype '${formatFiletype.name}' not possible with lint action.`);
	}

	const glob = getGlobByFormatModeAndFiletype(formatMode, formatFiletype.name);

	run( `${ command } ${ commandAction } ${ glob?.path ?? '' } ${ userPath ?? '' }`, 'lint' );
};


