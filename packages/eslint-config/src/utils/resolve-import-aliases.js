const path = require( 'path' );
const { tryResolveThemeContext } = require( '@yardinternet/shared-utils' );

/**
 * Resolves the `import/resolver` aliases for the current project layout.
 *
 * - brave-root: `@<theme>/scripts` for every theme in the themes directory.
 * - theme-root (cwd is a theme): `@<theme>/scripts` points at the local
 *   `./resources/scripts`.
 *
 * `@sage/scripts` is kept in both layouts, aliased to the default theme, so
 * starter code importing it keeps resolving in projects that do not name their
 * parent theme `sage`.
 */
const resolveImportAliases = () => {
	const context = tryResolveThemeContext();

	if ( ! context ) {
		// Not a WordPress project layout — assume the cwd is the theme.
		const themeName = path.basename( process.cwd() );

		return [
			[ `@${ themeName }/scripts`, './resources/scripts' ],
			[ '@sage/scripts', './resources/scripts' ],
		];
	}

	const scriptsPath = ( theme ) =>
		context.mode === 'theme-root'
			? './resources/scripts'
			: `./${ theme.relDirPosix }/resources/scripts`;

	const aliases = context.themes.map( ( theme ) => [
		`@${ theme.name }/scripts`,
		scriptsPath( theme ),
	] );

	if ( ! aliases.some( ( [ alias ] ) => alias === '@sage/scripts' ) ) {
		const defaultTheme = context.themes.find(
			( theme ) => theme.name === context.defaultTheme
		);

		if ( defaultTheme ) {
			aliases.push( [ '@sage/scripts', scriptsPath( defaultTheme ) ] );
		}
	}

	return aliases;
};

module.exports = resolveImportAliases;
