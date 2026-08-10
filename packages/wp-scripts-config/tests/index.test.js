'use strict';

const path = require( 'path' );
const sass = require( 'sass' );
const config = require( '../src/index.js' );
const disableSassCharset = require( '../src/transforms/disable-sass-charset' );

const BOM = '﻿';

const sassLoaders = ( webpackConfig ) =>
	( webpackConfig.module?.rules ?? [] )
		.filter( ( rule ) => Array.isArray( rule.use ) )
		.flatMap( ( rule ) => rule.use )
		.filter( ( use ) => use?.loader?.includes?.( 'sass-loader' ) );

// webpack is a nested dependency of @wordpress/scripts, so resolve it from there.
const webpack = () => {
	const scripts = path.dirname(
		require.resolve( '@wordpress/scripts/package.json' )
	);

	return require( require.resolve( 'webpack', { paths: [ scripts ] } ) );
};

describe( 'the exported config', () => {
	test( 'passes webpack’s own schema validation', () => {
		// Attaching anything but config keys to the export makes every consuming
		// build fail with "configuration has an unknown property".
		expect( () => webpack().validate( config ) ).not.toThrow();
	} );

	test( 'still has a sass-loader rule', () => {
		// A silent no-op would be worse than a failure: nothing would warn.
		expect( sassLoaders( config ).length ).toBeGreaterThan( 0 );
	} );

	test( 'sets charset: false while keeping the existing options', () => {
		for ( const loader of sassLoaders( config ) ) {
			expect( loader.options.sassOptions.charset ).toBe( false );
			expect( loader.options ).toHaveProperty( 'sourceMap' );
		}
	} );
} );

describe( 'disableSassCharset', () => {
	const fixture = () => ( {
		module: {
			rules: [
				{ test: /\.jsx?$/, use: [ { loader: 'babel-loader' } ] },
				{ test: /\.svg$/, use: 'raw-loader' },
				{},
				{
					test: /\.(sc|sa)ss$/,
					use: [
						{ loader: 'css-loader' },
						{
							loader: '/abs/node_modules/sass-loader/dist/cjs.js',
							options: {
								sourceMap: true,
								sassOptions: { quietDeps: true },
							},
						},
					],
				},
			],
		},
	} );

	test( 'merges into existing sassOptions instead of replacing them', () => {
		const result = disableSassCharset( fixture() );

		expect( sassLoaders( result )[ 0 ].options.sassOptions ).toEqual( {
			quietDeps: true,
			charset: false,
		} );
	} );

	test( 'leaves other loaders alone', () => {
		const result = disableSassCharset( fixture() );

		expect( result.module.rules[ 0 ].use[ 0 ] ).toEqual( {
			loader: 'babel-loader',
		} );
	} );
} );

describe( 'the Sass behaviour this works around', () => {
	const source = ':root{--brand:#037d96}.a::before{content:"“"}';

	test( 'compressed output is BOM-prefixed by default', () => {
		const { css } = sass.compileString( source, { style: 'compressed' } );

		expect( css.startsWith( BOM ) ).toBe( true );
	} );

	test( 'the charset option the package sets drops the BOM', () => {
		const { css } = sass.compileString( source, {
			style: 'compressed',
			...sassLoaders( config )[ 0 ].options.sassOptions,
		} );

		expect( css.startsWith( BOM ) ).toBe( false );
		expect( css ).toContain( '“' );
		expect( css ).toContain( '--brand:#037d96' );
	} );
} );
