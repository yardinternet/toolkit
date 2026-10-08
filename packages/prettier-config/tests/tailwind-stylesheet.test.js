'use strict';

const path = require( 'path' );
const {
	findTailwindStylesheet,
	findThemeStylesheets,
} = require( '../src/utils/find-tailwind-stylesheet' );
const { clearThemeContextCache } = require( '@yardinternet/shared-utils' );

const FIXTURES = path.resolve( __dirname, '../../shared-utils/tests/fixtures' );

const originalCwd = process.cwd();
const originalEnv = { ...process.env };

// The resolver reads the editor-provided cwd hints before process.cwd(), so
// tests have to control all of them.
const useProject = ( ...segments ) => {
	const root = path.join( FIXTURES, ...segments );

	process.chdir( root );
	process.env.PWD = root;
	delete process.env.VSCODE_CWD;
	clearThemeContextCache();

	return root;
};

afterEach( () => {
	process.chdir( originalCwd );
	process.env = { ...originalEnv };
	clearThemeContextCache();
} );

describe( 'findTailwindStylesheet', () => {
	test( 'uses the default theme in a bedrock project', () => {
		const root = useProject( 'bedrock' );

		expect( findTailwindStylesheet() ).toBe(
			path.join(
				root,
				'web/app/themes/sage/resources/styles/base/config.css'
			)
		);
	} );

	test( 'follows the configured default theme, not the first one', () => {
		const root = useProject( 'configured' );

		expect( findTailwindStylesheet() ).toBe(
			path.join(
				root,
				'src/themes/zulu/resources/styles/base/config.css'
			)
		);
	} );

	test( 'uses the local theme in theme-root', () => {
		const root = useProject( 'theme-root', 'basis' );

		expect( findTailwindStylesheet() ).toBe(
			path.join( root, 'resources/styles/base/config.css' )
		);
	} );

	test( 'returns null when no project layout resolves', () => {
		useProject( 'empty' );

		expect( findTailwindStylesheet() ).toBeNull();
	} );
} );

describe( 'findThemeStylesheets', () => {
	test( 'returns one entry per theme that has a config stylesheet', () => {
		const root = useProject( 'multi-parent' );

		expect( findThemeStylesheets() ).toEqual( [
			{
				dir: path.join( root, 'web/app/themes/idee' ),
				stylesheet: path.join(
					root,
					'web/app/themes/idee/resources/styles/base/config.css'
				),
			},
			{
				dir: path.join( root, 'web/app/themes/participatieeiland' ),
				stylesheet: path.join(
					root,
					'web/app/themes/participatieeiland/resources/styles/base/config.css'
				),
			},
			{
				dir: path.join( root, 'web/app/themes/sage' ),
				stylesheet: path.join(
					root,
					'web/app/themes/sage/resources/styles/base/config.css'
				),
			},
		] );
	} );

	test( 'stays empty for a single-theme project', () => {
		useProject( 'classic' );

		expect( findThemeStylesheets() ).toEqual( [] );
	} );
} );
