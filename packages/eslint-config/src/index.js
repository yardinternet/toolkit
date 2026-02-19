const globals = require( 'globals' );
const babelParser = require( '@babel/eslint-parser' );
const { fixupConfigRules } = require( '@eslint/compat' );
const js = require( '@eslint/js' );
const { FlatCompat } = require( '@eslint/eslintrc' );

const compat = new FlatCompat( {
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
} );

module.exports = [
	...fixupConfigRules(
		compat.extends(
			'plugin:@wordpress/eslint-plugin/recommended',
			'prettier'
		)
	),
	{
		files: [ '**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx' ],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				CLI: 'readonly',
				wp: 'readonly',
			},

			parser: babelParser,

			parserOptions: {
				requireConfigFile: false,

				babelOptions: {
					presets: [ '@babel/preset-react' ],
				},
				ecmaFeatures: {
					jsx: true,
				},
			},
		},

		rules: {
			'prettier/prettier': 0,
			'jsdoc/require-param': 0,
			'no-unused-expressions': [
				'error',
				{
					allowTernary: true,
				},
			],
			'import/no-unresolved': [
				'error',
				{ ignore: ['^@wordpress/'] },
			],
		},

		settings: {
			react: {
				version: '19.0',
			},
			'import/resolver': {
				alias: [
					[
						'@sage/scripts',
						'./web/app/themes/sage/resources/scripts',
					],
				],
			},
		},
	},
];
