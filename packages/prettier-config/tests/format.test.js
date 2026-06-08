'use strict';

const prettier = require( 'prettier' );
const path = require( 'path' );

// Resolve config for a given filename — applies the correct override options.
const CONFIG_PATH = path.resolve( __dirname, '../src/index.js' );

async function resolveOptions( filename ) {
	return prettier.resolveConfig( path.join( __dirname, filename ), {
		config: CONFIG_PATH,
	} );
}

describe( 'wp-prettier fork verification', () => {
	test( 'parenSpacing adds spaces inside function call parentheses', async () => {
		// CRITICAL: parenSpacing is a wp-prettier–only option.
		// Standard prettier silently ignores it — foo(bar) stays foo(bar).
		// If this test fails, the wrong prettier fork is installed.
		const options = await resolveOptions( 'test.js' );
		const output = await prettier.format( 'foo(bar, baz)', {
			...options,
			parser: 'babel',
		} );
		expect( output.trim() ).toBe( 'foo( bar, baz );' );
	} );

	test( 'parenSpacing adds spaces in nested calls', async () => {
		const options = await resolveOptions( 'test.js' );
		const output = await prettier.format( 'outer(inner(x))', {
			...options,
			parser: 'babel',
		} );
		expect( output.trim() ).toBe( 'outer( inner( x ) );' );
	} );
} );

describe( 'JS override options', () => {
	test( 'uses tabs for indentation', async () => {
		const options = await resolveOptions( 'test.js' );
		const output = await prettier.format(
			`function foo() {\nreturn "hello"\n}`,
			{ ...options, parser: 'babel' }
		);
		// Indented line must start with a tab, not spaces.
		expect( output ).toMatch( /\n\t/ );
	} );

	test( 'converts double quotes to single quotes', async () => {
		const options = await resolveOptions( 'test.js' );
		const output = await prettier.format( `const x = "hello";`, {
			...options,
			parser: 'babel',
		} );
		expect( output ).toContain( "'hello'" );
		expect( output ).not.toContain( '"hello"' );
	} );

	test( 'adds trailing commas in objects (es5)', async () => {
		const options = await resolveOptions( 'test.js' );
		const output = await prettier.format(
			`const obj = {\n  a: 1,\n  b: 2\n};`,
			{ ...options, parser: 'babel' }
		);
		// Last property must have a trailing comma before closing brace.
		expect( output ).toMatch( /b: 2,\n/ );
	} );

	test( 'adds semicolons', async () => {
		const options = await resolveOptions( 'test.js' );
		const output = await prettier.format( `const x = 1`, {
			...options,
			parser: 'babel',
		} );
		expect( output.trim() ).toMatch( /;$/ );
	} );

	test( 'always wraps arrow function params in parens (arrowParens: always)', async () => {
		const options = await resolveOptions( 'test.js' );
		const output = await prettier.format( `const fn = x => x;`, {
			...options,
			parser: 'babel',
		} );
		// parenSpacing (wp-prettier) adds spaces inside the parens: ( x ) =>
		expect( output ).toMatch( /\( x \) =>/ );
		// But the param must still be wrapped in parens (arrowParens: always), not bare: x =>
		expect( output ).not.toMatch( /\bx =>/ );
		expect( output ).not.toMatch( /x =>/ );
		expect( output ).toMatch( /=>/ ); // sanity: it's still an arrow function
	} );
} );
