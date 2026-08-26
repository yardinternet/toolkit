import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createBasePackageConfig } from '../src/configs/base-package.js';

const FIXTURE = path.resolve( import.meta.dirname, 'fixtures/package' );

const pluginNames = async ( options ) => {
	const config = await createBasePackageConfig( options )();

	return config.plugins
		.flat()
		.filter( Boolean )
		.map( ( plugin ) => plugin.name );
};

let cwd;

beforeEach( () => {
	cwd = process.cwd();
	process.chdir( FIXTURE );
} );

afterEach( () => {
	process.chdir( cwd );
} );

describe( 'createBasePackageConfig dts option', () => {
	it( 'registers vite-plugin-dts for TypeScript entries by default', async () => {
		const names = await pluginNames( {
			entryPoints: { editor: 'resources/src/entries/editor.tsx' },
		} );

		expect( names ).toContain( 'vite:dts' );
	} );

	it( 'omits vite-plugin-dts when dts is false', async () => {
		const names = await pluginNames( {
			entryPoints: { editor: 'resources/src/entries/editor.tsx' },
			dts: false,
		} );

		expect( names ).not.toContain( 'vite:dts' );
	} );
} );
