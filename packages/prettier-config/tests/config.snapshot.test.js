'use strict';

const config = require( '../src/index.js' );

test( 'prettier config options match snapshot (excludes machine-specific plugin paths)', () => {
	// Omit plugins: they contain absolute paths that differ per machine.
	const { plugins, ...options } = config;
	expect( options ).toMatchSnapshot();
} );

test( 'blade plugin is configured', () => {
	expect(
		config.plugins.some( ( p ) => p.includes( 'prettier-plugin-blade' ) )
	).toBe( true );
} );

test( 'tailwindcss plugin is configured', () => {
	expect(
		config.plugins.some( ( p ) =>
			p.includes( 'prettier-plugin-tailwindcss' )
		)
	).toBe( true );
} );

test( 'tailwindStylesheet is not present in test environment', () => {
	// Confirms findTailwindStylesheet() returns null outside a real project.
	// If this fails, snapshot tests may become non-deterministic.
	expect( config.tailwindStylesheet ).toBeUndefined();
} );
