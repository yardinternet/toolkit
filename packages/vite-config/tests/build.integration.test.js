import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { build } from 'vite';
import { laravelPackageConfig } from '../src/configs/laravel-package.js';

const FIXTURE = path.resolve( import.meta.dirname, 'fixtures/package' );
const PUBLIC_DIR = path.join( FIXTURE, 'public' );

const ENTRY_POINTS = {
	banner: 'resources/src/entries/banner.ts',
	editor: 'resources/src/entries/editor.tsx',
};

const read = ( file ) =>
	fs.readFileSync( path.join( PUBLIC_DIR, file ), 'utf8' );

const fragment = ( entry ) =>
	JSON.parse( read( path.join( '.assets', `${ entry }.json` ) ) );

let cwd;

beforeAll( async () => {
	cwd = process.cwd();
	process.chdir( FIXTURE );
	fs.rmSync( PUBLIC_DIR, { recursive: true, force: true } );

	for ( const entry of Object.keys( ENTRY_POINTS ) ) {
		process.env.ENTRY = entry;
		await build( {
			configFile: false,
			...( await laravelPackageConfig( {
				entryPoints: ENTRY_POINTS,
			} )() ),
		} );
	}
}, 60_000 );

afterAll( () => {
	process.chdir( cwd );
	delete process.env.ENTRY;
} );

describe( 'laravel package build output', () => {
	it( 'emits one self-contained script per entry', () => {
		for ( const entry of Object.keys( ENTRY_POINTS ) ) {
			const code = read( `${ entry }.js` );

			expect( code ).not.toMatch( /(^|[;\s])import\s*[{('"]/ );
			expect( code ).not.toMatch( /(^|[;\s])export\s*[{*]/ );
		}
	} );

	it( 'emits no shared chunks', () => {
		expect( fs.existsSync( path.join( PUBLIC_DIR, 'chunks' ) ) ).toBe(
			false
		);
	} );

	it( 'names each stylesheet after its entry', () => {
		expect( fragment( 'banner' ).css ).toEqual( [ 'banner.css' ] );
		expect( fragment( 'editor' ).css ).toEqual( [ 'editor.css' ] );
	} );

	it( 'inlines shared CSS into every entry that reaches it', () => {
		expect( read( 'banner.css' ) ).toContain( 'color:red' );
		expect( read( 'editor.css' ) ).toContain( 'color:red' );
	} );

	it( 'records exact per-entry WordPress dependencies', () => {
		expect( fragment( 'banner' ).deps ).toEqual( [] );
		expect( fragment( 'editor' ).deps ).toEqual( [
			'wp-components',
			'wp-element',
			'wp-i18n',
		] );
	} );

	it( 'ships no .d.ts files and no roots deps asset', () => {
		const files = fs.readdirSync( PUBLIC_DIR, { recursive: true } );

		expect(
			files.filter( ( file ) => String( file ).endsWith( '.d.ts' ) )
		).toEqual( [] );
		expect( files ).not.toContain(
			path.join( 'assets', 'editor.deps.json' )
		);
	} );
} );
