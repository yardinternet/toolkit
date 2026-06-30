/**
 * External dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import { resolveThemeContext } from './resolve-theme-context.js';

/**
 * Returns the owning theme name for a discovered block path, for logging.
 *
 * - theme-root: the single theme's name.
 * - brave-root: parsed from the `web/app/themes/<theme>/...` block path.
 */
export const getBlockThemeName = ( blockPath ) => {
	const context = resolveThemeContext();

	if ( context.mode === 'theme-root' ) {
		return context.defaultTheme;
	}

	return blockPath.split( path.sep ).at( 3 );
};
