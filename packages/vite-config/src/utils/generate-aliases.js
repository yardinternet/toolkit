/**
 * External dependencies
 */
import path from 'path';

/**
 * Generates the aliases for each theme to use like `@theme-name`.
 * Example: `background-image: url('@sage/images/logo.svg')`; or `import '@sage-child/scripts/frontend/frontend.js';`
 */
const generateAliases = ( themeNames ) => {
	const themesDir = path.resolve( process.cwd(), 'web/app/themes' );
	const aliases = {};

	if ( ! themeNames || themeNames.length === 0 ) {
		throw new Error( 'No theme names provided for alias generation.' );
	}

	themeNames.forEach( ( themeName ) => {
		const sanitizedThemeName = themeName.replace( /[^a-zA-Z0-9-_]/g, '-' );

		aliases[ `@${ sanitizedThemeName }` ] = path.join(
			themesDir,
			themeName,
			'resources'
		);
	} );

	return aliases;
};

export { generateAliases };
