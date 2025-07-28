/**
 * External dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import { getThemeNames } from './get-theme-names.js';

/**
 * Generates the aliases for each theme to use like `@theme-name`.
 * Example: `background-image: url('@sage/images/logo.svg')`; or `import '@sage-child/scripts/frontend/frontend.js';`
 */
const generateAliases = () => {
	const themesDir = path.resolve( process.cwd(), 'web/app/themes' );
	const themeNames = getThemeNames();
	const aliases = {};

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
