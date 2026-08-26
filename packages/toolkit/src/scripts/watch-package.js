/**
 * External dependencies
 */
import { spawn } from 'child_process';

/**
 * Internal dependencies
 */
import { ensureFileExists, setupGracefulShutdown } from '../utils/helpers.js';
import { readEntryPoints } from './build-package.js';
import { writeEntryMap } from '../utils/entry-map.js';
import log from '../utils/logger.js';

export const watchPackage = async ( configFile = 'vite.config.js' ) => {
	ensureFileExists(
		configFile,
		`❌ ${ configFile } not found in the project root.`
	);

	const entries = await readEntryPoints( configFile );

	if ( entries.length === 0 ) {
		log.error( 'No entry points found to watch.', true, 0 );
	}

	const children = entries.map( ( entry ) => {
		log.info( `Watching entry: ${ entry }` );

		const child = spawn(
			'vite',
			[ 'build', '--watch', '--config', configFile ],
			{
				stdio: 'inherit',
				env: { ...process.env, ENTRY: entry, FORCE_COLOR: true },
			}
		);

		child.on( 'error', ( err ) => {
			log.error(
				`❌ Failed to start vite for ${ entry }: ${ err.message }`,
				false
			);
		} );

		return child;
	} );

	setupGracefulShutdown( children );

	// Vite's --watch gives no cross-process "all rebuilt" signal, so the map is
	// refreshed on a timer. Handles are only ever added, never invalidated, so a
	// map that trails a rebuild by a second is harmless.
	setInterval( () => writeEntryMap(), 1000 ).unref();
};
