/**
 * External dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import { resolveThemeContext } from '@yardinternet/shared-utils';

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
	 * Starter source imports the parent theme's resources as `@sage/...` (e.g. `@sage/styles/base/config.css`). Projects that do not name their parent theme `sage` have nothing for that alias to point at, so it falls back to the default theme's resources.
	 */
	if ( ! aliases[ '@sage' ] ) {
		aliases[ '@sage' ] = path.join(
			context.themeDir( context.defaultTheme ),
			'resources'
		);
	}

	return aliases;
};
