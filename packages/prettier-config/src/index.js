const path = require( 'path' );
const {
	findTailwindStylesheet,
	findThemeStylesheets,
} = require( './utils/find-tailwind-stylesheet' );

const tailwindStylesheet = findTailwindStylesheet();

/**
 * Prettier merges every matching override in order, so these only narrow the
 * Tailwind stylesheet per theme — a file is sorted against its own theme's
 * config instead of a single project-wide one. Globs are absolute and posix,
 * since override patterns resolve against the config file's directory.
 */
const themeOverrides = findThemeStylesheets().map( ( theme ) => ( {
	files: `${ theme.dir.split( path.sep ).join( '/' ) }/**`,
	options: { tailwindStylesheet: theme.stylesheet },
} ) );

module.exports = {
	...require( '@wordpress/prettier-config' ),
	plugins: [
		require.resolve( '@shufo/prettier-plugin-blade' ),
		require.resolve( 'prettier-plugin-tailwindcss' ),
	],
	...( tailwindStylesheet && { tailwindStylesheet } ),
	overrides: [
		...themeOverrides,
		{
			files: [ '*.css', '*.js', '*.jsx', '*.ts', '*.tsx' ],
			options: {
				useTabs: true,
				printWidth: 80,
				singleQuote: true,
				trailingComma: 'es5',
				bracketSpacing: true,
				parenSpacing: true,
				bracketSameLine: false,
				semi: true,
				arrowParens: 'always',
			},
		},
		{
			files: [ '*.blade.php' ],
			options: {
				parser: 'blade',
				sortTailwindcssClasses: true,
				tabWidth: 1,
				printWidth: 120,
			},
		},
	],
};
