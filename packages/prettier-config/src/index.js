const findTailwindStylesheet = require( './utils/find-tailwind-stylesheet' );

const tailwindStylesheet = findTailwindStylesheet();

module.exports = {
	...require( '@wordpress/prettier-config' ),
	plugins: [
		require.resolve( '@shufo/prettier-plugin-blade' ),
		require.resolve( 'prettier-plugin-tailwindcss' ),
	],
	...( tailwindStylesheet && { tailwindStylesheet } ),
	overrides: [
		{
			files: [ '*.css', '*.js', '*.jsx', '*.ts', '*.tsx' ],
			options: {
				useTabs: true,
				printWidth: 80,
				singleQuote: true,
				trailingComma: 'es5',
				bracketSpacing: true,
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
