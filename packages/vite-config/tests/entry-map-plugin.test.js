import { describe, expect, it, vi } from 'vitest';
import { entryMapPlugin } from '../src/utils/entry-map-plugin.js';

const run = ( bundle, entry = 'editor' ) => {
	const emitFile = vi.fn();
	const plugin = entryMapPlugin( { entry } );

	plugin.generateBundle.call( { emitFile }, {}, bundle );

	return {
		emitFile,
		emitted: JSON.parse( emitFile.mock.calls[ 0 ][ 0 ].source ),
	};
};

const entryChunk = ( overrides = {} ) => ( {
	type: 'chunk',
	isEntry: true,
	fileName: 'editor.js',
	code: 'var a = 1;',
	...overrides,
} );

const cssAsset = ( name = 'editor.css' ) => ( {
	type: 'asset',
	name,
	fileName: name,
} );

describe( 'entryMapPlugin', () => {
	it( 'emits the fragment under .assets/<entry>.json', () => {
		const { emitFile } = run( { 'editor.js': entryChunk() } );

		expect( emitFile ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'asset',
				fileName: '.assets/editor.json',
			} )
		);
	} );

	it( 'records the entry filename and its stylesheets', () => {
		const { emitted } = run( {
			'editor.js': entryChunk(),
			'editor.css': cssAsset(),
		} );

		expect( emitted.js ).toBe( 'editor.js' );
		expect( emitted.css ).toEqual( [ 'editor.css' ] );
	} );

	it( 'records the entry stylesheet, not some other emitted css asset', () => {
		const { emitted } = run( {
			'other.css': cssAsset( 'other.css' ),
			'editor.js': entryChunk(),
			'editor.css': cssAsset(),
		} );

		expect( emitted.css ).toEqual( [ 'editor.css' ] );
	} );

	it( 'reads dependencies from the roots plugin asset and sorts them', () => {
		const { emitted } = run( {
			'editor.js': entryChunk(),
			'assets/editor.deps.json': {
				type: 'asset',
				name: 'editor.deps.json',
				source: JSON.stringify( [ 'wp-i18n', 'wp-components' ] ),
			},
		} );

		expect( emitted.deps ).toEqual( [ 'wp-components', 'wp-i18n' ] );
	} );

	it( 'adds wp-element when the injected JSX pragma is present', () => {
		const { emitted } = run( {
			'editor.js': entryChunk( { code: 'wp.element.createElement(x)' } ),
			'assets/editor.deps.json': {
				type: 'asset',
				name: 'editor.deps.json',
				source: JSON.stringify( [ 'wp-components' ] ),
			},
		} );

		expect( emitted.deps ).toEqual( [ 'wp-components', 'wp-element' ] );
	} );

	it( 'does not add wp-element when no pragma is present', () => {
		const { emitted } = run( { 'editor.js': entryChunk() } );

		expect( emitted.deps ).toEqual( [] );
	} );

	it( 'removes the roots deps asset from the bundle', () => {
		const bundle = {
			'editor.js': entryChunk(),
			'assets/editor.deps.json': {
				type: 'asset',
				name: 'editor.deps.json',
				source: '[]',
			},
		};

		run( bundle );

		expect( bundle[ 'assets/editor.deps.json' ] ).toBeUndefined();
	} );

	it( 'emits an empty record when the bundle has no entry chunk', () => {
		const { emitted } = run( {} );

		expect( emitted ).toEqual( { js: '', css: [], deps: [] } );
	} );
} );
