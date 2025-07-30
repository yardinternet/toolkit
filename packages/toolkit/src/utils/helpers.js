/**
 * External dependencies
 */
import fs from 'fs';
import util from 'util';
import { exec } from 'child_process';
import { spawn } from 'child_process';

/**
 * Internal dependences
 */
import { filetypes } from '../config/filetypes.js';
import { modes } from '../config/modes.js';
import log from './logger.js';

export const runCommand = async (
	command,
	args = [],
	options = { stdio: 'inherit', shell: true }
) => {
	log.info( `Running: ${ command } ${ args.join( ' ' ) }` );

	const child = spawn( command, args, options );

	child.on( 'exit', ( code ) => {
		if ( code === 0 ) {
			log.success( `Completed ${ command } successfully.` );
		} else {
			log.error( `Exited ${ command } with code ${ code }` );
		}
	} );
};

const fromString = (
	configObject,
	nameString,
	errorWhenNotFound,
	errorSearchName
) => {
	if ( ! nameString ) log.error( `${ errorSearchName } was not set!` );

	const result = filterObjectByName( nameString, configObject );

	if ( errorWhenNotFound && result === null )
		log.error( `${ errorSearchName } ${ nameString } was not found!` );

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

export const getGlobByFormatModeAndFiletype = ( formatMode, filetype ) => {
	return formatMode.paths?.find( ( path ) => path.filetype === filetype );
};

export const ensureFileExists = ( filePath, errorMsg = null ) => {
	if ( ! fs.existsSync( filePath ) ) {
		log.error( errorMsg || `${ filePath } not found.`, true, 1 );
	}
};

export const handleParallelResults = ( results, itemType = 'item' ) => {
	const failed = results.filter( ( r ) => r.status === 'rejected' );
	if ( failed.length > 0 ) {
		log.error( `❌ ${ failed.length } ${ itemType }(s) failed.`, true, 1 );
	} else {
		log.success( `✅ All ${ itemType }s processed successfully!` );
	}
};

export const execWithEnv = async ( command, env = {}, options = {} ) => {
	const execAsync = util.promisify( exec );
	return execAsync( command, {
		env: { ...process.env, ...env },
		...options,
	} );
};

export const setupGracefulShutdown = ( children ) => {
	process.on( 'SIGINT', () => {
		children.forEach( ( child ) => {
			if ( child && ! child.killed ) child.kill( 'SIGINT' );
		} );
		process.exit( 0 );
	} );
};
