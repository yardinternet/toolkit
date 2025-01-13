import chalk from 'chalk';
import { exit } from 'node:process';
import { exec } from 'node:child_process';
import { filetypes } from '../config/filetypes.js';
import { modes } from '../config/modes.js';
import {options} from "../config/options.js";

export const error = (
	msg = 'An error occurred',
	die = true,
	exitCode = 1
) => {
	// eslint-disable-next-line no-console
	console.error( `[${ chalk.red( 'error' ) }] ${ msg }` );

	if ( die ) {
		exit( exitCode );
	}
};

export const info = ( msg ) => {
	// eslint-disable-next-line no-console
	console.info( `[${ chalk.blue( 'info' ) }] ${ msg }` );
};

export const commandOutputLog = ( commandLabel, msg ) => {
	// eslint-disable-next-line no-console
	console.log( `[${ chalk.green( commandLabel ) }]\n${ msg }` );
};

export const run = ( command, commandLabel = 'external script' ) => {
	exec( command, ( isError, commandOutput, commandError ) => {
		info( `Running: '${ command }'` );

		if ( isError ) commandOutputLog( commandLabel, commandError );

		if ( commandOutput != '' )
			commandOutputLog( commandLabel, commandOutput );
	} );
};

const fromString = (
	configObject,
	nameString,
	errorWhenNotFound,
	errorSearchName
) => {
	if ( nameString == null ) error( `${ errorSearchName } was not set!` );

	const result = filterObjectByName( nameString, configObject );

	if ( errorWhenNotFound && result === null )
		error( `${ errorSearchName } ${ nameString } was not found!` );

	return result;
};

export const filetypeFromString = (
	filetypeString,
	errorWhenNotFound = false
) => {
	return fromString(
		filetypes,
		filetypeString,
		errorWhenNotFound,
		'Filetype'
	);
};

export const modesFromString = ( modesString, errorWhenNotFound = false ) => {
	return fromString( modes, modesString, errorWhenNotFound, 'Mode' );
};

export const filterObjectByName = ( name, object ) => {
	for ( const [ key, value ] of Object.entries( object ) ) {
		if ( name === value.name ) {
			return object[ key ];
		}
	}

	return null;
};

export const getGlobByFormatModeAndFiletype = (formatMode, filetype) => {
	return formatMode.paths?.find(
		( path ) => path.filetype === filetype
	);
}
