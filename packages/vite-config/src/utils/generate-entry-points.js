/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

/**
 * Internal dependencies
 */
import { resolveThemeContext } from './resolve-theme-context.js';

/**
 * Returns an array of valid entry point paths for the specified themes.
 */
export const generateEntryPoints = ( {
	themesToProcess,
	entryPoints = [],
} ) => {
	const context = resolveThemeContext();
	const resolvedEntryPoints = [];

	if ( ! themesToProcess || themesToProcess.length === 0 ) {
		throw new Error(
			'No theme names provided for entry point generation.'
		);
	}

	themesToProcess.forEach( ( themeName ) => {
		const themeDir = context.themeDir( themeName );

		// Push valid file paths to the input list
		entryPoints.forEach( ( entry ) => {
			const entryPoint = path.join( themeDir, entry );
			if ( fs.existsSync( entryPoint ) ) {
				resolvedEntryPoints.push( entryPoint );
			}
		} );
	} );

	return resolvedEntryPoints;
};
