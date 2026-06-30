const globals = require( 'globals' );
const babelParser = require( '@babel/eslint-parser' );
const tsParser = require( '@typescript-eslint/parser' );
const tsPlugin = require( '@typescript-eslint/eslint-plugin' );
const { fixupConfigRules } = require( '@eslint/compat' );
const js = require( '@eslint/js' );
const { FlatCompat } = require( '@eslint/eslintrc' );
const resolveImportAliases = require( './utils/resolve-import-aliases' );

const compat = new FlatCompat( {
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
} );

// Shared between the JS/JSX and TS/TSX configs.
const sharedGlobals = {
	...globals.browser,
	...globals.node,
	CLI: 'readonly',
	wp: 'readonly',
};

const sharedSettings = {
	react: {
		version: '19.0',
	},
};

// Formatting is owned by Prettier (`pnpm format`), not ESLint.
const sharedRules = {
	'prettier/prettier': 0,
	'jsdoc/require-param': 0,
	'import/no-extraneous-dependencies': 0,
};

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
			globals: sharedGlobals,

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
			...sharedRules,
			'no-unused-expressions': [
				'error',
				{
					allowTernary: true,
				},
			],
			'import/no-unresolved': [ 'error', { ignore: [ '^@wordpress/' ] } ],
		},

		settings: {
			...sharedSettings,
			'import/resolver': {
				alias: resolveImportAliases(),
			},
		},
	},
	{
		files: [ '**/*.ts', '**/*.tsx' ],
		languageOptions: {
			globals: sharedGlobals,

			// The @typescript-eslint plugin is already registered by
			// @wordpress/eslint-plugin/recommended above; only set the parser.
			parser: tsParser,

			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},

		rules: {
			...tsPlugin.configs.recommended.rules,
			...sharedRules,
			// TS-aware version replaces the core rule.
			'no-unused-expressions': 0,
			'@typescript-eslint/no-unused-expressions': [
				'error',
				{
					allowTernary: true,
				},
			],
			// TypeScript + the bundler resolve modules (incl. path aliases).
			'import/no-unresolved': 0,
		},

		settings: sharedSettings,
	},
];
