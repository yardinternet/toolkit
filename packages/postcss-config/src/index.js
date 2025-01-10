const { getPathToTheme } = require( './scripts/helpers' );
const path = require( 'path' );

// Add alias paths for PostCSS imports
const resolveAliasPaths = ( id ) => {
	if ( id.startsWith( '@sage' ) ) {
		const relativePath = id.replace( '@sage', '' ).trimStart( '/' );

		const sageParentThemeStylesPath = path.join(
			__dirname,
			'web/app/themes/sage/resources/styles'
		);
		return path.join( sageParentThemeStylesPath, relativePath );
	}
	return id;
};

module.exports = ( ctx ) => {
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
			config: path.resolve( getPathToTheme(), 'tailwind.config.cjs' ),
		},
	};

	// Production-specific plugins
	if ( ctx.env === 'production' ) {
		plugins.cssnano = { preset: 'default' }; // Minify the CSS
	}

	return { plugins };
};
