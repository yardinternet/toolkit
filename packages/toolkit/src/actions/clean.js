/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

/**
 * Internal dependencies
 */
import { resolveThemeContext } from '@yardinternet/shared-utils';
import log from '../utils/logger.js';

/**
 * Removes leftover Vite hot files.
 *
 * The dev server deletes them on shutdown, but a hard kill leaves them behind
 * and the site then points at a dev server that is no longer running.
 */
export const clean = () => {
	const context = resolveThemeContext();
	let removed = 0;

	context.themes.forEach( ( theme ) => {
		const hotFile = path.join( theme.dir, 'public', 'hot' );

		if ( ! fs.existsSync( hotFile ) ) {
			return;
		}

		fs.rmSync( hotFile );
		removed++;
		log.info( `Removed ${ path.join( theme.relDir, 'public', 'hot' ) }` );
	} );

	if ( removed === 0 ) {
		log.info( 'No hot files found.' );
		return;
	}

	log.success( `Removed ${ removed } hot file(s).` );
};
