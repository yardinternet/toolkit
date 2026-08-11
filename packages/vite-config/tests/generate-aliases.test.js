import path from 'path';
import { afterEach, expect, test } from 'vitest';
import {
	clearThemeContextCache,
	getAllThemeNames,
} from '@yardinternet/shared-utils';

import { generateAliases } from '../src/utils/generate-aliases.js';

const FIXTURES = path.resolve(
	import.meta.dirname,
	'../../shared-utils/tests/fixtures'
);

const originalCwd = process.cwd();

const useProject = ( ...segments ) => {
	process.chdir( path.join( FIXTURES, ...segments ) );
	clearThemeContextCache();
};

afterEach( () => {
	process.chdir( originalCwd );
	clearThemeContextCache();
} );

test( 'aliases every theme by name', () => {
	useProject( 'multi-parent' );

	const aliases = generateAliases( getAllThemeNames() );

	expect( Object.keys( aliases ).sort() ).toEqual( [
		'@idee',
		'@participatieeiland',
		'@sage',
	] );
	expect( aliases[ '@sage' ] ).toBe(
		path.join( process.cwd(), 'web/app/themes/sage/resources' )
	);
} );

test( '@sage falls back to the default theme when no sage theme exists', () => {
	useProject( 'configured' );

	const aliases = generateAliases( getAllThemeNames() );

	expect( aliases[ '@sage' ] ).toBe(
		path.join( process.cwd(), 'src/themes/zulu/resources' )
	);
} );

test( 'theme-root aliases the local resources', () => {
	useProject( 'theme-root', 'basis' );

	const aliases = generateAliases( getAllThemeNames() );

	expect( aliases[ '@basis' ] ).toBe(
		path.join( process.cwd(), 'resources' )
	);
	expect( aliases[ '@sage' ] ).toBe(
		path.join( process.cwd(), 'resources' )
	);
} );
