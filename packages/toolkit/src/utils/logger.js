import chalk from 'chalk';
import { exit } from 'node:process';

const baseLog = (
	type = 'info',
	msg = '',
	{ bold = false, color = 'white' } = {}
) => {
	const typeColor = chalk[ color ] || chalk.white;
	const styledType = bold ? typeColor.bold( type ) : typeColor( type );
	const prefix = chalk.gray( '[Yard toolkit]' );
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
