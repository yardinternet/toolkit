import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { laravelPackageConfig } from '../src/configs/laravel-package.js';

const FIXTURE = path.resolve( import.meta.dirname, 'fixtures/package' );

const ENTRY_POINTS = {
	banner: 'resources/src/entries/banner.ts',
	editor: 'resources/src/entries/editor.tsx',
};

let cwd;

beforeEach( () => {
	cwd = process.cwd();
	process.chdir( FIXTURE );
} );

afterEach( () => {
	process.chdir( cwd );
	delete process.env.ENTRY;
} );

describe( 'laravelPackageConfig', () => {
	it( 'exposes the entry names without evaluating the config', () => {
		const config = laravelPackageConfig( { entryPoints: ENTRY_POINTS } );

		expect( config.entryPoints ).toEqual( [ 'banner', 'editor' ] );
	} );

	it( 'throws when evaluated with ENTRY unset', async () => {
		const config = laravelPackageConfig( { entryPoints: ENTRY_POINTS } );

		await expect( config() ).rejects.toThrow(
			/yard-toolkit build package/
		);
	} );

	it( 'builds only the entry named by ENTRY, as a named IIFE', async () => {
		process.env.ENTRY = 'editor';

		const { build } = await laravelPackageConfig( {
			entryPoints: ENTRY_POINTS,
		} )();

		expect( build.lib.formats ).toEqual( [ 'iife' ] );
		expect( build.lib.name ).toBe( 'editor' );
		expect( build.lib.cssFileName ).toBe( 'editor' );
		expect( Object.keys( build.lib.entry ) ).toEqual( [ 'editor' ] );
		expect( build.lib.fileName( 'iife', 'editor' ) ).toBe( 'editor.js' );
	} );

	it( 'writes to public/ and never wipes sibling entries', async () => {
		process.env.ENTRY = 'banner';

		const { build } = await laravelPackageConfig( {
			entryPoints: ENTRY_POINTS,
		} )();

		expect( build.outDir ).toBe( 'public' );
		expect( build.emptyOutDir ).toBe( false );
	} );

	it( 'registers entryMapPlugin for the built entry', async () => {
		process.env.ENTRY = 'banner';

		const config = await laravelPackageConfig( {
			entryPoints: ENTRY_POINTS,
		} )();
		const names = config.plugins
			.flat()
			.filter( Boolean )
			.map( ( plugin ) => plugin.name );

		expect( names ).toContain( 'yard-entry-map' );
		expect( names ).not.toContain( 'vite:dts' );
	} );

	it( 'sanitises entry names that are not valid identifiers', async () => {
		process.env.ENTRY = 'address-field';

		const { build } = await laravelPackageConfig( {
			entryPoints: { 'address-field': 'resources/src/entries/banner.ts' },
		} )();

		expect( build.lib.name ).toBe( 'address_field' );
	} );

	it( 'ignores a package attempting to override the IIFE contract', async () => {
		process.env.ENTRY = 'banner';

		const { build } = await laravelPackageConfig( {
			entryPoints: ENTRY_POINTS,
			formats: [ 'es' ],
		} )();

		expect( build.lib.formats ).toEqual( [ 'iife' ] );
	} );

	it( 'ignores a package attempting to widen formats through build.lib', async () => {
		process.env.ENTRY = 'banner';

		const { build } = await laravelPackageConfig( {
			entryPoints: ENTRY_POINTS,
			build: { lib: { formats: [ 'es' ] } },
		} )();

		expect( build.lib.formats ).toEqual( [ 'iife' ] );
	} );

	it( 'ignores an array-form rollup output, which would void lib.formats', async () => {
		process.env.ENTRY = 'banner';

		const { build } = await laravelPackageConfig( {
			entryPoints: ENTRY_POINTS,
			build: { rollupOptions: { output: [ { format: 'es' } ] } },
		} )();

		/*
		 * Vite drops lib.formats as soon as output is an array — with a warning,
		 * not an error — so iife only holds while output stays an object.
		 */
		expect( Array.isArray( build.rollupOptions.output ) ).toBe( false );
		expect( build.lib.formats ).toEqual( [ 'iife' ] );
	} );

	it( 'ignores a package attempting to re-enable emptyOutDir', async () => {
		process.env.ENTRY = 'banner';

		const { build } = await laravelPackageConfig( {
			entryPoints: ENTRY_POINTS,
			build: { emptyOutDir: true },
		} )();

		expect( build.emptyOutDir ).toBe( false );
	} );
} );
