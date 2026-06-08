'use strict';

const { Linter } = require( 'eslint' );
const config = require( '../src/index.js' );

const linter = new Linter( { configType: 'flat' } );

/**
 * Lint a code string and return only messages for a specific rule.
 * filename must match the config's files pattern (e.g. '**\/*.js').
 */
// Use an absolute path within the package so FlatCompat-derived configs apply.
const TEST_FILE = require( 'path' ).join( __dirname, '..', 'test.js' );

function messagesForRule( code, ruleId, filename = TEST_FILE ) {
	return linter
		.verify( code, config, { filename } )
		.filter( ( m ) => m.ruleId === ruleId );
}

describe( 'explicitly configured rules', () => {
	describe( 'no-unused-expressions', () => {
		test( 'errors on unused logical AND expression', () => {
			// Short-circuit `x && foo()` is an unused expression — not allowed.
			const messages = messagesForRule(
				'var x = true; x && foo();',
				'no-unused-expressions'
			);
			expect( messages.length ).toBeGreaterThan( 0 );
		} );

		test( 'allows ternary expressions (allowTernary: true)', () => {
			// `x ? a() : b()` is allowed because allowTernary is true.
			const messages = messagesForRule(
				'var x = true; x ? foo() : bar();',
				'no-unused-expressions'
			);
			expect( messages ).toHaveLength( 0 );
		} );
	} );

	describe( 'import/no-unresolved', () => {
		test( 'ignores @wordpress/* imports (configured ignore pattern)', () => {
			// The config sets ignore: ['^@wordpress/'] — these must not error.
			const messages = messagesForRule(
				`import { useSelect } from '@wordpress/data';`,
				'import/no-unresolved'
			);
			expect( messages ).toHaveLength( 0 );
		} );

		test( 'fires on unresolvable non-@wordpress imports (rule is active)', () => {
			// Proves the rule is enforcing — not vacuously passing because the plugin is unloaded.
			const messages = messagesForRule(
				`import foo from 'definitely-not-installed-xyz-pkg';`,
				'import/no-unresolved'
			);
			expect( messages.length ).toBeGreaterThan( 0 );
		} );
	} );

	describe( 'disabled rules', () => {
		test( 'prettier/prettier is disabled (severity 0)', () => {
			// Must not fire regardless of formatting.
			const messages = messagesForRule(
				`var x="ugly"`,
				'prettier/prettier'
			);
			expect( messages ).toHaveLength( 0 );
		} );

		test( 'import/no-extraneous-dependencies is disabled', () => {
			const messages = messagesForRule(
				`import foo from 'some-unlisted-package';`,
				'import/no-extraneous-dependencies'
			);
			expect( messages ).toHaveLength( 0 );
		} );

		test( 'jsdoc/require-param is disabled', () => {
			// A function with an undocumented param must not trigger jsdoc errors.
			const messages = messagesForRule(
				`/** @returns {void} */ function foo(undocumented) {}`,
				'jsdoc/require-param'
			);
			expect( messages ).toHaveLength( 0 );
		} );
	} );
} );

describe( 'curated inherited rules', () => {
	test( 'no-unused-vars errors on declared-but-unused variable', () => {
		const messages = messagesForRule(
			'const unused = 1;',
			'no-unused-vars'
		);
		expect( messages.length ).toBeGreaterThan( 0 );
	} );

	test( 'no-console errors on console.log call', () => {
		const messages = messagesForRule(
			`console.log('hello');`,
			'no-console'
		);
		expect( messages.length ).toBeGreaterThan( 0 );
	} );
} );
