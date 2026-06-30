/**
 * External dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import { resolveThemeContext } from './resolve-theme-context.js';

/**
 * Generates the aliases for each theme to use like `@theme-name`.
 * Example: `background-image: url('@sage/images/logo.svg')`; or `import '@sage-child/scripts/frontend/frontend.js';`
 */
export const generateAliases = ( themeNames ) => {
	const context = resolveThemeContext();
	const aliases = {};

	if ( ! themeNames || themeNames.length === 0 ) {
		throw new Error( 'No theme names provided for alias generation.' );
	}

	themeNames.forEach( ( themeName ) => {
		const sanitizedThemeName = themeName.replace( /[^a-zA-Z0-9-_]/g, '-' );

		aliases[ `@${ sanitizedThemeName }` ] = path.join(
			context.themeDir( themeName ),
			'resources'
		);
	} );

	/**
	 * In a theme-root build the shared `@sage` alias (used by starter source for
	 * imports like `@sage/styles/base/config.css`) has no sage theme to point
	 * at, so map it to the local resources for backwards compatibility.
	 */
	if ( context.mode === 'theme-root' && ! aliases[ '@sage' ] ) {
		aliases[ '@sage' ] = path.join( context.themeDir(), 'resources' );
	}

	return aliases;
};
