const globals = require( 'globals' );
const wordpress = require( '@wordpress/eslint-plugin' );
const tseslint = require( 'typescript-eslint' );
const resolveImportAliases = require( './utils/resolve-import-aliases' );

// The plugin only registers prettier when `prettier` is installed. Referencing
// prettier/prettier otherwise throws "Could not find plugin 'prettier'".
const prettierRegistered = wordpress.configs.recommended.some(
	( config ) => config.plugins && config.plugins.prettier
);

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
	'jsdoc/require-param': 0,
	'import/no-extraneous-dependencies': 0,
	...( prettierRegistered ? { 'prettier/prettier': 0 } : {} ),
};

module.exports = [
	...wordpress.configs.recommended,
	{
		files: [ '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs' ],
		languageOptions: {
			globals: sharedGlobals,
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
	// Register TS ourselves so it works regardless of whether the consumer has
	// `typescript` installed. Scoped to TS files to keep the babel parser on JS.
	...tseslint.configs.recommended.map( ( config ) => ( {
		...config,
		files: [ '**/*.ts', '**/*.tsx' ],
	} ) ),
	{
		files: [ '**/*.ts', '**/*.tsx' ],
		languageOptions: {
			globals: sharedGlobals,
		},
		rules: {
			...sharedRules,
			// TS-aware version replaces the core rule.
			'no-unused-expressions': 0,
			'@typescript-eslint/no-unused-expressions': [
				'error',
				{
					allowTernary: true,
				},
			],
			// TS + bundler resolve modules, incl. path aliases.
			'import/no-unresolved': 0,
		},
		settings: sharedSettings,
	},
];
