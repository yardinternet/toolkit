'use strict';

const path = require( 'path' );
const {
	clearThemeContextCache,
	getAllThemeNames,
	resolveThemeContext,
	tryResolveThemeContext,
} = require( '../src/resolve-theme-context.cjs' );

const fixture = ( name ) => path.join( __dirname, 'fixtures', name );
const resolve = ( name ) => resolveThemeContext( { cwd: fixture( name ) } );

beforeEach( () => {
	clearThemeContextCache();
	delete process.env.YARD_THEMES_DIR;
} );

describe( 'bedrock (the existing Brave layout)', () => {
	test( 'resolves the historical themes dir and asset base url', () => {
		const context = resolve( 'bedrock' );

		expect( context.mode ).toBe( 'brave-root' );
		expect( context.themesRelDirPosix ).toBe( 'web/app/themes' );
		expect( context.themesBaseUrl ).toBe( '/app/themes' );
		expect( context.docRoot ).toBe(
			path.join( fixture( 'bedrock' ), 'web' )
		);
		expect( context.defaultTheme ).toBe( 'sage' );
	} );

	test( 'discovers themes and their parent/child relationship', () => {
		const context = resolve( 'bedrock' );

		expect( context.themes.map( ( theme ) => theme.name ) ).toEqual( [
			'sage',
			'sage-child',
		] );
		expect( context.parents.map( ( theme ) => theme.name ) ).toEqual( [
			'sage',
		] );
		expect( context.getTheme( 'sage-child' ).template ).toBe( 'sage' );
		expect( context.getTheme( 'sage' ).title ).toBe( 'Sage' );
	} );

	test( 'themeRelDir matches the pre-refactor value', () => {
		const context = resolve( 'bedrock' );

		expect( context.themeRelDir( 'sage' ) ).toBe(
			path.join( 'web', 'app', 'themes', 'sage' )
		);
		expect( context.themeRelDirPosix( 'sage' ) ).toBe(
			'web/app/themes/sage'
		);
	} );

	test( 'themeForPath maps a block path back to its theme', () => {
		const context = resolve( 'bedrock' );
		const blockPath = path.join(
			'web',
			'app',
			'themes',
			'sage',
			'resources',
			'scripts',
			'blocks',
			'hero'
		);

		expect( context.themeForPath( blockPath ).name ).toBe( 'sage' );
		expect( context.themeForPath( 'web/app/plugins/foo' ) ).toBeNull();
	} );
} );

describe( 'alternative layouts', () => {
	test( 'composer installer-paths win over the probe list', () => {
		const context = resolve( 'bedrock-custom-dir' );

		expect( context.source ).toBe( 'composer' );
		expect( context.themesRelDirPosix ).toBe( 'site/wp-content/themes' );
		expect( context.themesBaseUrl ).toBe( '/wp-content/themes' );
		expect( context.defaultTheme ).toBe( 'main' );
	} );

	test( 'classic wp-content layout resolves without a docroot subdir', () => {
		const context = resolve( 'classic' );

		expect( context.themesRelDirPosix ).toBe( 'wp-content/themes' );
		expect( context.themesBaseUrl ).toBe( '/wp-content/themes' );
		expect( context.docRoot ).toBe( fixture( 'classic' ) );
	} );

	test( 'a stray wp-content/themes never beats web/app/themes', () => {
		const context = resolve( 'decoy' );

		expect( context.source ).toBe( 'probe' );
		expect( context.themesRelDirPosix ).toBe( 'web/app/themes' );
	} );

	test( 'theme-root collapses every path to the cwd', () => {
		const context = resolveThemeContext( {
			cwd: path.join( fixture( 'theme-root' ), 'basis' ),
		} );

		expect( context.mode ).toBe( 'theme-root' );
		expect( context.defaultTheme ).toBe( 'basis' );
		expect( context.themeRelDir( 'basis' ) ).toBe( '.' );
		expect( context.themesBaseUrl ).toBe( '/wp-content/themes' );
	} );
} );

describe( 'explicit configuration', () => {
	test( 'package.json yardToolkit key sets dir and default theme', () => {
		const context = resolve( 'configured' );

		expect( context.source ).toBe( 'config' );
		expect( context.themesRelDirPosix ).toBe( 'src/themes' );
		expect( context.defaultTheme ).toBe( 'zulu' );
	} );

	test( 'yard-toolkit.config.json can override the asset base url', () => {
		const context = resolve( 'configured-file' );

		expect( context.themesRelDirPosix ).toBe( 'themes' );
		expect( context.themesBaseUrl ).toBe( '/custom/themes' );
	} );

	test( 'YARD_THEMES_DIR overrides the probe list', () => {
		process.env.YARD_THEMES_DIR = 'wp-content/themes';
		clearThemeContextCache();

		const context = resolve( 'decoy' );

		expect( context.source ).toBe( 'env' );
		expect( context.themesRelDirPosix ).toBe( 'wp-content/themes' );
	} );
} );

describe( 'default theme selection', () => {
	test( 'sage keeps winning when several parents exist', () => {
		const context = resolve( 'multi-parent' );

		expect( context.parents.map( ( theme ) => theme.name ) ).toEqual( [
			'participatieeiland',
			'sage',
		] );
		expect( context.defaultTheme ).toBe( 'sage' );
	} );

	test( 'without sage it falls back alphabetically and warns once', () => {
		const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

		try {
			expect( resolve( 'multi-parent-no-sage' ).defaultTheme ).toBe(
				'alpha'
			);
			expect( warn ).toHaveBeenCalledTimes( 1 );
			expect( warn.mock.calls[ 0 ][ 0 ] ).toContain( 'defaultTheme' );
		} finally {
			warn.mockRestore();
		}
	} );
} );

describe( 'failure handling', () => {
	test( 'throws with guidance when nothing resolves', () => {
		expect( () => resolve( 'empty' ) ).toThrow(
			/Unable to determine project context/
		);
	} );

	test( 'tryResolveThemeContext returns null instead of throwing', () => {
		expect(
			tryResolveThemeContext( { cwd: fixture( 'empty' ) } )
		).toBeNull();
	} );
} );

describe( 'caching', () => {
	test( 'repeated calls return the same object', () => {
		expect( resolve( 'bedrock' ) ).toBe( resolve( 'bedrock' ) );
	} );

	test( 'getAllThemeNames reads through the cache', () => {
		expect( getAllThemeNames( { cwd: fixture( 'bedrock' ) } ) ).toEqual( [
			'sage',
			'sage-child',
		] );
	} );
} );
