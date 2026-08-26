import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildPackage } from '../src/scripts/build-package.js';

const FIXTURES = path.resolve(
	import.meta.dirname,
	'../../vite-config/tests/fixtures'
);
/*
 * pnpm puts node_modules/.bin on PATH for the real CLI; vitest does not, and
 * buildPackage shells out to `vite`.
 */
const VITE_BIN = path.resolve(
	import.meta.dirname,
	'../../vite-config/node_modules/.bin'
);

let cwd;
let dir;
let originalPath;

const read = ( file ) =>
	fs.readFileSync( path.join( dir, 'public', file ), 'utf8' );

beforeAll( async () => {
	/*
	 * A copy rather than the fixture itself: vite-config's own integration test
	 * builds into the same public/ directory and both suites run concurrently.
	 * It stays a sibling of the fixture so the relative import in its
	 * vite.config.js and Vite's node_modules lookup both still resolve.
	 */
	dir = fs.mkdtempSync( path.join( FIXTURES, 'build-package-' ) );
	fs.cpSync( path.join( FIXTURES, 'package' ), dir, {
		recursive: true,
		filter: ( src ) => ! src.endsWith( `${ path.sep }public` ),
	} );

	cwd = process.cwd();
	originalPath = process.env.PATH;
	process.chdir( dir );
	process.env.PATH = `${ VITE_BIN }${ path.delimiter }${ originalPath }`;

	await buildPackage();
}, 180_000 );

afterAll( () => {
	process.chdir( cwd );
	process.env.PATH = originalPath;
	fs.rmSync( dir, { recursive: true, force: true } );
} );

describe( 'buildPackage', () => {
	it( 'writes one assets.json entry per declared entry point', () => {
		const map = JSON.parse( read( 'assets.json' ) );

		expect( Object.keys( map.entries ).sort() ).toEqual( [
			'banner',
			'editor',
		] );
	} );

	it( 'records the WordPress dependencies of each entry', () => {
		const map = JSON.parse( read( 'assets.json' ) );

		expect( map.entries.editor.deps ).toEqual( [
			'wp-components',
			'wp-element',
			'wp-i18n',
		] );
		expect( map.entries.banner.deps ).toEqual( [] );
	} );

	it( 'names only files that exist on disk', () => {
		const map = JSON.parse( read( 'assets.json' ) );

		for ( const entry of Object.values( map.entries ) ) {
			for ( const file of [ entry.js, ...entry.css ] ) {
				expect(
					fs.existsSync( path.join( dir, 'public', file ) )
				).toBe( true );
			}
		}
	} );

	it( 'removes the fragment directory once merged', () => {
		expect( fs.existsSync( path.join( dir, 'public', '.assets' ) ) ).toBe(
			false
		);
	} );
} );
