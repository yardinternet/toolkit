const fs = require( 'fs' );
const path = require( 'path' );

const tailwindPath = path.resolve(
	process.cwd(),
	'web/app/themes/sage/resources/styles/base/config.css'
);

const hasTailwindConfig = fs.existsSync( tailwindPath );

module.exports = {
	...require( '@wordpress/prettier-config' ),
	plugins: [
		require.resolve( '@shufo/prettier-plugin-blade' ),
		require.resolve( 'prettier-plugin-tailwindcss' ),
	],
	...( hasTailwindConfig && {
		tailwindStylesheet: tailwindPath,
	} ),
	overrides: [
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
