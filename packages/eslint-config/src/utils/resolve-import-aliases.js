const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Resolves the `import/resolver` aliases for the current project layout.
 *
 * - brave-root (default): the `@sage/scripts` alias, unchanged.
 * - theme-root (cwd is a theme — no `web/app/themes`, has `style.css`): point
 *   both `@<theme>/scripts` and the `@sage/scripts` at the local
 *   `./resources/scripts` so theme imports resolve.
 */
const resolveImportAliases = () => {
	const cwd = process.cwd();
	const isBraveRoot = fs.existsSync( path.resolve( cwd, 'web/app/themes' ) );

	if ( isBraveRoot ) {
		return [
			[ '@sage/scripts', './web/app/themes/sage/resources/scripts' ],
		];
	}

	const themeName = path.basename( cwd );

	return [
		[ `@${ themeName }/scripts`, './resources/scripts' ],
		// Brave-root alias kept so shared/starter code importing `@sage/scripts`
		// keeps resolving in a theme-root build.
		[ '@sage/scripts', './resources/scripts' ],
	];
};

module.exports = resolveImportAliases;
