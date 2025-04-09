import {
	error,
	filetypeFromString,
	getGlobByFormatModeAndFiletype,
	modesFromString,
	run,
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
			command = 'wp-scripts lint-style';
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

	run(
		`${ command } ${ glob?.path ?? '' } ${ userPath ?? '' } ${
			isFix ? '--fix' : ''
		}`,
		'lint'
	);
};
