import { exit } from 'node:process';
import { styleText } from 'node:util';

const baseLog = (
	type = 'info',
	msg = '',
	{ bold = false, color = 'white' } = {}
) => {
	// Nested calls, not a format array: Node 20 ignores isTTY for arrays.
	const styledType = styleText(
		color,
		bold ? styleText( 'bold', type ) : type
	);
	const prefix = styleText( 'gray', '[Yard toolkit]' );
	// eslint-disable-next-line no-console
	console.log( `${ prefix } [${ styledType }] ${ msg }` );
};

const log = {
	info( msg, options = {} ) {
		baseLog( 'info', msg, { color: 'blue', ...options } );
	},
	success( msg, options = {} ) {
		baseLog( 'success', msg, { color: 'green', ...options } );
	},
	warn( msg, options = {} ) {
		baseLog( 'warn', msg, { color: 'yellow', ...options } );
	},
	error( msg = 'An error occurred', die = true, exitCode = 1, options = {} ) {
		baseLog( 'error', msg, { color: 'red', bold: true, ...options } );
		if ( die ) {
			exit( exitCode );
		}
	},
};

export default log;
