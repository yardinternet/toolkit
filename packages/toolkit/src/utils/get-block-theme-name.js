/**
 * Internal dependencies
 */
import { resolveThemeContext } from '@yardinternet/shared-utils';

/**
 * Returns the owning theme name for a discovered block path, for logging.
 */
export const getBlockThemeName = ( blockPath ) => {
	const context = resolveThemeContext();

	if ( context.mode === 'theme-root' ) {
		return context.defaultTheme;
	}

	return context.themeForPath( blockPath )?.name ?? 'unknown';
};
