import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeEntryMap } from '../src/utils/entry-map.js';

let dir;

const writeFragment = ( name, data ) => {
	fs.mkdirSync( path.join( dir, '.assets' ), { recursive: true } );
	fs.writeFileSync(
		path.join( dir, '.assets', `${ name }.json` ),
		JSON.stringify( data )
	);
};

const readMap = () =>
	JSON.parse( fs.readFileSync( path.join( dir, 'assets.json' ), 'utf8' ) );

beforeEach( () => {
	dir = fs.mkdtempSync( path.join( os.tmpdir(), 'yard-entry-map-' ) );
} );

afterEach( () => {
	fs.rmSync( dir, { recursive: true, force: true } );
} );

describe( 'writeEntryMap', () => {
	it( 'merges every fragment under an entries key', () => {
		writeFragment( 'banner', {
			js: 'banner.js',
			css: [ 'banner.css' ],
			deps: [],
		} );
		writeFragment( 'editor', {
			js: 'editor.js',
			css: [],
			deps: [ 'wp-components' ],
		} );

		writeEntryMap( dir );

		expect( readMap() ).toEqual( {
			entries: {
				banner: { js: 'banner.js', css: [ 'banner.css' ], deps: [] },
				editor: { js: 'editor.js', css: [], deps: [ 'wp-components' ] },
			},
		} );
	} );

	it( 'removes the fragment directory afterwards', () => {
		writeFragment( 'banner', { js: 'banner.js', css: [], deps: [] } );

		writeEntryMap( dir );

		expect( fs.existsSync( path.join( dir, '.assets' ) ) ).toBe( false );
	} );

	it( 'leaves an existing map alone when there are no fragments', () => {
		fs.writeFileSync(
			path.join( dir, 'assets.json' ),
			JSON.stringify( {
				entries: { kept: { js: 'kept.js', css: [], deps: [] } },
			} )
		);

		writeEntryMap( dir );

		expect( readMap().entries.kept.js ).toBe( 'kept.js' );
	} );

	it( 'overlays fragments on existing entries (watch case)', () => {
		fs.writeFileSync(
			path.join( dir, 'assets.json' ),
			JSON.stringify( {
				entries: {
					banner: {
						js: 'banner.js',
						css: [ 'banner.css' ],
						deps: [],
					},
					editor: {
						js: 'editor.js',
						css: [],
						deps: [ 'wp-components' ],
					},
				},
			} )
		);

		writeFragment( 'banner', {
			js: 'banner-v2.js',
			css: [ 'banner-v2.css' ],
			deps: [],
		} );

		writeEntryMap( dir );

		const map = readMap();
		expect( map.entries.banner.js ).toBe( 'banner-v2.js' );
		expect( map.entries.editor.js ).toBe( 'editor.js' );
	} );
} );
