const globals = require( 'globals' );
// eslint-disable-next-line import/no-extraneous-dependencies
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
		files: [ '**/*.js', '**/*.jsx' ],
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
		},

		settings: {
			react: {
				version: '19.0',
			},
			'import/resolver': {
				alias: [
					[
						'@sage/scripts',
						'./web/app/themes/sage-child/resources/scripts',
					],
				],
			},
		},
	},
];
