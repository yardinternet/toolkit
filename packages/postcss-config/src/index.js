const path = require( 'path' );
const { tryResolveThemeContext } = require( '@yardinternet/shared-utils' );

/**
 * Styles of the parent theme the `@sage` import alias points at. Falls back to
 * the historical sage path when the project layout cannot be resolved.
 */
const defaultStylesPath = ( basePath ) => {
	const context = tryResolveThemeContext( { cwd: basePath } );

	if ( ! context ) {
		return 'web/app/themes/sage/resources/styles';
	}

	return path.join(
		context.themeRelDir( context.defaultTheme ),
		'resources',
		'styles'
	);
};

module.exports = ( pathToTheme, basePath, pathToStyles = null ) => {
	const parentStylesPath = pathToStyles ?? defaultStylesPath( basePath );

	// Add alias paths for PostCSS imports
	const resolveAliasPaths = ( id ) => {
		if ( id.startsWith( '@sage' ) ) {
			const relativePath = id.replace( '@sage', '' ).trimStart( '/' );

			const sageParentThemeStylesPath = path.join(
				basePath,
				parentStylesPath
			);
			return path.join( sageParentThemeStylesPath, relativePath );
		}
		return id;
	};

	return ( ctx ) => {
		// Plugins for all environments
		const plugins = {
			autoprefixer: {},
			'postcss-mixins': {},
			'postcss-import': {
				resolve: resolveAliasPaths,
			},
			'tailwindcss/nesting': {},
			'postcss-nested': {}, // We want nested rules the same way Sass works. Also needed for postcss-mixins.
			tailwindcss: {
				config: path.resolve( pathToTheme, 'tailwind.config.cjs' ),
			},
		};

		// Production-specific plugins
		if ( ctx.env === 'production' ) {
			plugins.cssnano = { preset: 'default' }; // Minify the CSS
		}

		return { plugins };
	};
};
