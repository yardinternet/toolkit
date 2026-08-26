/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Internal dependencies
 */
import {
	ensureFileExists,
	execWithEnv,
	handleParallelResults,
} from '../utils/helpers.js';
import { writeEntryMap } from '../utils/entry-map.js';
import log from '../utils/logger.js';

export const readEntryPoints = async ( configFile ) => {
	const module = await import(
		pathToFileURL( path.resolve( configFile ) ).href
	);

	return module.default?.entryPoints ?? [];
};

export const buildPackage = async ( configFile = 'vite.config.js' ) => {
	ensureFileExists(
		configFile,
		`❌ ${ configFile } not found in the project root.`
	);

	const entries = await readEntryPoints( configFile );

	if ( entries.length === 0 ) {
		log.error( 'No entry points found to build.', true, 0 );
	}

	fs.rmSync( 'public', { recursive: true, force: true } );

	const results = await Promise.allSettled(
		entries.map( async ( entry ) => {
			log.info( `Building entry: ${ entry }` );
			try {
				const { stdout } = await execWithEnv(
					`vite build --config ${ configFile }`,
					{
						ENTRY: entry,
						FORCE_COLOR: true,
					}
				);
				log.info( stdout );
				log.info( `Entry ${ entry } built successfully.` );
			} catch ( err ) {
				const stderr = err.stderr || err.message || 'Unknown error';
				log.error(
					`Error building entry ${ entry }:\n${ stderr }`,
					false
				);
				throw err;
			}
		} )
	);

	writeEntryMap();

	handleParallelResults( results, 'entry' );
};
