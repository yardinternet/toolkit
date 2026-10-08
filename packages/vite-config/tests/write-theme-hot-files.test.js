import fs from 'fs';
import os from 'os';
import path from 'path';
import { EventEmitter } from 'events';
import { afterEach, describe, expect, test } from 'vitest';

import { writeThemeHotFiles } from '../src/plugins/write-theme-hot-files.js';

const tempRoots = [];

const makeProject = ( themeNames ) => {
	const root = fs.mkdtempSync( path.join( os.tmpdir(), 'yard-hot-' ) );
	tempRoots.push( root );

	const themes = themeNames.map( ( name ) => {
		const dir = path.join( root, 'themes', name );
		fs.mkdirSync( dir, { recursive: true } );

		return { name, dir };
	} );

	return { root, context: { themes } };
};

const makeServer = () => ( {
	httpServer: new EventEmitter(),
	watcher: { unwatch: () => {} },
	config: { logger: { warn: () => {} } },
} );

const flush = () => new Promise( ( resolve ) => setTimeout( resolve, 20 ) );

afterEach( () => {
	while ( tempRoots.length ) {
		fs.rmSync( tempRoots.pop(), { recursive: true, force: true } );
	}
} );

describe( 'writeThemeHotFiles', () => {
	test( 'copies the dev server hot file into every other theme', async () => {
		const { context } = makeProject( [ 'sage', 'idee', 'eiland' ] );
		const sourceHotFile = path.join(
			context.themes[ 0 ].dir,
			'public',
			'hot'
		);

		fs.mkdirSync( path.dirname( sourceHotFile ), { recursive: true } );
		fs.writeFileSync( sourceHotFile, 'http://localhost:5173' );

		const plugin = writeThemeHotFiles( { context, sourceHotFile } );
		const server = makeServer();

		plugin.configureServer( server );
		server.httpServer.emit( 'listening' );
		await flush();

		context.themes.forEach( ( theme ) => {
			const hotFile = path.join( theme.dir, 'public', 'hot' );

			expect( fs.readFileSync( hotFile, 'utf8' ) ).toBe(
				'http://localhost:5173'
			);
		} );
	} );

	test( 'ignores the hot file inside the watcher config', () => {
		const { context } = makeProject( [ 'sage' ] );
		const plugin = writeThemeHotFiles( {
			context,
			sourceHotFile: 'unused',
		} );

		expect( plugin.config().server.watch.ignored ).toContain(
			'**/public/hot'
		);
	} );

	test( 'only applies to the dev server', () => {
		const { context } = makeProject( [ 'sage' ] );

		expect(
			writeThemeHotFiles( { context, sourceHotFile: 'unused' } ).apply
		).toBe( 'serve' );
	} );
} );
