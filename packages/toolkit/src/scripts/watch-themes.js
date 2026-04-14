/**
 * External dependencies
 */
import { spawn } from 'child_process';

/**
 * Internal dependencies
 */
import log from '../utils/logger.js';

export const watchThemes = ( configFile = 'vite.config.js' ) => {
	const child = spawn( 'vite', [ '--config', configFile ], {
		stdio: 'inherit',
	} );
	child.on( 'error', ( err ) => {
		log.error( `❌ Failed to start vite: ${ err.message }` );
	} );
};
