/**
 * External dependencies
 */
import { spawn } from 'child_process';

/**
 * Internal dependencies
 */
import log from '../utils/logger.js';

export const watchThemes = () => {
	const child = spawn( 'vite', [], {
		stdio: 'inherit',
		shell: true,
	} );
	child.on( 'error', ( err ) => {
		log.error( `❌ Failed to start vite: ${ err.message }` );
	} );
};
