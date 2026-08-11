'use strict';

const path = require( 'path' );
const resolveImportAliases = require( '../src/utils/resolve-import-aliases' );
const { clearThemeContextCache } = require( '@yardinternet/shared-utils' );

const FIXTURES = path.resolve( __dirname, '../../shared-utils/tests/fixtures' );

const originalCwd = process.cwd();

const useProject = ( ...segments ) => {
	process.chdir( path.join( FIXTURES, ...segments ) );
	clearThemeContextCache();
};

afterEach( () => {
	process.chdir( originalCwd );
	clearThemeContextCache();
} );

test( 'brave-root aliases every theme and keeps @sage/scripts', () => {
	useProject( 'bedrock' );

	expect( resolveImportAliases() ).toEqual( [
		[ '@sage/scripts', './web/app/themes/sage/resources/scripts' ],
		[
			'@sage-child/scripts',
			'./web/app/themes/sage-child/resources/scripts',
		],
	] );
} );

test( '@sage/scripts falls back to the default theme when no sage exists', () => {
	useProject( 'configured' );

	expect( resolveImportAliases() ).toEqual( [
		[ '@alpha/scripts', './src/themes/alpha/resources/scripts' ],
		[ '@zulu/scripts', './src/themes/zulu/resources/scripts' ],
		[ '@sage/scripts', './src/themes/zulu/resources/scripts' ],
	] );
} );

test( 'theme-root points every alias at the local resources', () => {
	useProject( 'theme-root', 'basis' );

	expect( resolveImportAliases() ).toEqual( [
		[ '@basis/scripts', './resources/scripts' ],
		[ '@sage/scripts', './resources/scripts' ],
	] );
} );

test( 'unresolvable layouts keep the historical theme-root guess', () => {
	useProject( 'empty' );

	expect( resolveImportAliases() ).toEqual( [
		[ '@empty/scripts', './resources/scripts' ],
		[ '@sage/scripts', './resources/scripts' ],
	] );
} );
