'use strict';

const config = require( '../src/index.js' );

test( 'eslint config array length is stable', () => {
	// If a plugin adds or removes config objects, this catches it immediately.
	expect( Array.isArray( config ) ).toBe( true );
	// Snapshot the count — fails when @wordpress/eslint-plugin adds/removes config blocks.
	expect( config.length ).toMatchSnapshot();
} );

test( 'eslint config explicit rules match snapshot', () => {
	// Snapshot only the rule maps (serializable). Functions like parsers/plugins
	// are excluded here — their presence is verified in behavioral tests.
	const ruleEntries = config
		.filter( ( c ) => c.rules && Object.keys( c.rules ).length > 0 )
		.map( ( c ) => c.rules );
	expect( ruleEntries ).toMatchSnapshot();
} );

test( 'eslint config files patterns match snapshot', () => {
	// compat.extends() blocks use function matchers (non-serializable) — filter to strings only.
	const filePatterns = config
		.filter( ( c ) => c.files )
		.map( ( c ) => c.files.filter( ( f ) => typeof f === 'string' ) )
		.filter( ( patterns ) => patterns.length > 0 );
	expect( filePatterns ).toMatchSnapshot();
} );
