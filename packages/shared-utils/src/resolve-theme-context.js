/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

/**
 * Resolves the project context for build/watch/lint/format tooling.
 *
 * Two layouts are supported:
 *
 * - `brave-root` (default): invoked from the root of a Brave/Bedrock
 *   project where themes live at `web/app/themes/<theme>`.
 * - `theme-root`: invoked from inside a single theme directory (cwd is the
 *   theme). Every theme path collapses to the cwd, so a theme can build, watch,
 *   lint and format on its own.
 *
 * Detection is automatic and cheap:
 * 1. A `web/app/themes` directory in cwd → brave-root.
 * 2. A `style.css` in cwd → theme-root (cwd is a WordPress theme).
 * 3. Otherwise throw with guidance.
 */

const THEMES_SUBDIR = path.join( 'web', 'app', 'themes' );

const isDirectory = ( dirPath ) => {
	try {
		return fs.statSync( dirPath ).isDirectory();
	} catch {
		return false;
	}
};

const detectMode = ( cwd ) => {
	if ( isDirectory( path.resolve( cwd, THEMES_SUBDIR ) ) ) {
		return 'brave-root';
	}

	if ( fs.existsSync( path.resolve( cwd, 'style.css' ) ) ) {
		return 'theme-root';
	}

	return null;
};

/**
 * Discovers theme directories (dirs containing a `style.css`) inside a
 * brave-root themes directory.
 */
const discoverThemeNames = ( themesDir ) => {
	if ( ! isDirectory( themesDir ) ) {
		return [];
	}

	return fs.readdirSync( themesDir ).filter( ( dirName ) => {
		const fullPath = path.join( themesDir, dirName );

		if ( ! isDirectory( fullPath ) ) {
			return false;
		}

		return fs.existsSync( path.join( fullPath, 'style.css' ) );
	} );
};

export const resolveThemeContext = () => {
	const cwd = process.cwd();
	const mode = detectMode( cwd );

	if ( mode === 'theme-root' ) {
		const name = path.basename( cwd );

		return {
			mode,
			themes: [ { name, dir: cwd, relDir: '.' } ],
			themeDir: () => cwd,
			themeRelDir: () => '.',
			defaultTheme: name,
		};
	}

	if ( mode === 'brave-root' ) {
		const themesDir = path.resolve( cwd, THEMES_SUBDIR );
		const themes = discoverThemeNames( themesDir ).map( ( name ) => ( {
			name,
			dir: path.join( themesDir, name ),
			relDir: path.join( THEMES_SUBDIR, name ),
		} ) );

		return {
			mode,
			themes,
			themeDir: ( name ) => path.join( themesDir, name ),
			themeRelDir: ( name ) => path.join( THEMES_SUBDIR, name ),
			defaultTheme: 'sage',
		};
	}

	throw new Error(
		'Unable to determine project context: no "web/app/themes" directory ' +
			'and no "style.css" in the current directory. Run from a Brave ' +
			'project root or from a theme directory.'
	);
};
