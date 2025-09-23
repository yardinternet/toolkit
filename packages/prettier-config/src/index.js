module.exports = {
	...require( '@wordpress/prettier-config' ),
	plugins: [
		require.resolve( '@shufo/prettier-plugin-blade' ),
		require.resolve( 'prettier-plugin-tailwindcss' ),
	],
	overrides: [
		{
			files: [ '*.css', '*.js', '*.jsx' ],
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
