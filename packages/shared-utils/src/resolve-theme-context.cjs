'use strict';

/**
 * Resolves the project layout for build/watch/lint/format tooling.
 *
 * Two layouts are supported:
 *
 * - `brave-root` (default): invoked from the root of a Bedrock-style project
 *   where themes live in a themes directory such as `web/app/themes/<theme>`.
 * - `theme-root`: invoked from inside a single theme directory (cwd is the
 *   theme). Every theme path collapses to the cwd, so a theme can build, watch,
 *   lint and format on its own.
 *
 * Authored as CommonJS so the CJS configs (eslint, prettier, postcss) and the
 * ESM packages (toolkit, vite-config) share one implementation without a build
 * step. `src/index.js` re-exports it for ESM consumers.
 */

const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Probed in order, first hit wins. `web/app/themes` is first so every existing
 * Brave project resolves exactly as it did before this file grew a resolver.
 */
const THEMES_DIR_CANDIDATES = [
	'web/app/themes',
	'wp-content/themes',
	'app/themes',
	'public/wp-content/themes',
	'content/themes',
];

const DOCROOT_MARKERS = [ 'index.php', 'wp-config.php' ];

/**
 * Only used when no docroot marker is present on disk.
 */
const DOCROOT_DIR_NAMES = [ 'web', 'public', 'public_html', 'htdocs', 'www' ];

/**
 * A theme's `style.css` can be an entire compiled stylesheet, so only the
 * header block is ever read.
 */
const STYLE_HEADER_BYTES = 8192;

const CONFIG_FILENAME = 'yard-toolkit.config.json';
const PACKAGE_JSON_KEY = 'yardToolkit';
const ENV_THEMES_DIR = 'YARD_THEMES_DIR';

const cache = new Map();
const warned = new Set();

const warnOnce = ( key, message ) => {
	if ( warned.has( key ) ) {
		return;
	}

	warned.add( key );
	// eslint-disable-next-line no-console
	console.warn( `[yard-toolkit] ${ message }` );
};

const toPosix = ( value ) => value.split( path.sep ).join( '/' );

const isDirectory = ( target ) => {
	try {
		return fs.statSync( target ).isDirectory();
	} catch {
		return false;
	}
};

const isFile = ( target ) => {
	try {
		return fs.statSync( target ).isFile();
	} catch {
		return false;
	}
};

const readJson = ( target ) => {
	try {
		return JSON.parse( fs.readFileSync( target, 'utf8' ) );
	} catch {
		return null;
	}
};

/**
 * Reads at most the first `STYLE_HEADER_BYTES` of a file.
 */
const readHead = ( target ) => {
	let fd;

	try {
		fd = fs.openSync( target, 'r' );
		const buffer = Buffer.alloc( STYLE_HEADER_BYTES );
		const bytesRead = fs.readSync( fd, buffer, 0, STYLE_HEADER_BYTES, 0 );

		return buffer.toString( 'utf8', 0, bytesRead );
	} catch {
		return '';
	} finally {
		if ( fd !== undefined ) {
			try {
				fs.closeSync( fd );
			} catch {
				// Nothing sensible to do here.
			}
		}
	}
};

/**
 * Reads a WordPress style.css header field. Tolerates both the plain
 * `/* Key: value` and the asterisk-prefixed ` * Key: value` comment styles.
 */
const readStyleHeaderField = ( contents, field ) => {
	const match = contents.match(
		new RegExp( `^[\\s*/]*${ field }\\s*:\\s*(.+)$`, 'im' )
	);

	if ( ! match ) {
		return null;
	}

	return match[ 1 ].replace( /\*+\/\s*$/, '' ).trim() || null;
};

const listThemeDirNames = ( themesDir ) => {
	if ( ! isDirectory( themesDir ) ) {
		return [];
	}

	return fs
		.readdirSync( themesDir )
		.filter( ( dirName ) => {
			const fullPath = path.join( themesDir, dirName );

			return (
				isDirectory( fullPath ) &&
				isFile( path.join( fullPath, 'style.css' ) )
			);
		} )
		.sort();
};

const readProjectConfig = ( root ) => {
	const configFile = readJson( path.join( root, CONFIG_FILENAME ) );

	if ( configFile && typeof configFile === 'object' ) {
		return configFile;
	}

	const packageJson = readJson( path.join( root, 'package.json' ) );
	const fromPackage = packageJson && packageJson[ PACKAGE_JSON_KEY ];

	if ( fromPackage && typeof fromPackage === 'object' ) {
		return fromPackage;
	}

	return {};
};

/**
 * Bedrock and friends declare their themes directory in composer.json:
 * `extra.installer-paths` maps `web/app/themes/{$name}` to `type:wordpress-theme`.
 */
const themesDirFromComposer = ( root ) => {
	const composer = readJson( path.join( root, 'composer.json' ) );
	const installerPaths = composer?.extra?.[ 'installer-paths' ];

	if ( ! installerPaths || typeof installerPaths !== 'object' ) {
		return null;
	}

	for ( const [ pattern, targets ] of Object.entries( installerPaths ) ) {
		const isThemePath =
			Array.isArray( targets ) &&
			targets.some(
				( target ) =>
					typeof target === 'string' &&
					target.toLowerCase() === 'type:wordpress-theme'
			);

		if ( ! isThemePath || ! pattern.includes( '{$name}' ) ) {
			continue;
		}

		const dir = path.posix.dirname( pattern.replace( /\\/g, '/' ) );

		if ( dir && dir !== '.' ) {
			return dir;
		}
	}

	return null;
};

/**
 * A candidate only counts when it holds at least one actual theme, which keeps
 * a stale or unrelated directory from winning the resolution.
 */
const acceptThemesDir = ( root, relDir ) => {
	if ( ! relDir ) {
		return null;
	}

	const dir = path.resolve( root, relDir );

	if ( listThemeDirNames( dir ).length === 0 ) {
		return null;
	}

	return { dir, relDir: path.relative( root, dir ) };
};

const detectThemesDir = ( root ) => {
	const config = readProjectConfig( root );

	const layers = [
		[ 'config', config.themesDir ],
		[ 'env', process.env[ ENV_THEMES_DIR ] ],
		[ 'composer', themesDirFromComposer( root ) ],
		...THEMES_DIR_CANDIDATES.map( ( candidate ) => [
			'probe',
			candidate,
		] ),
	];

	for ( const [ source, candidate ] of layers ) {
		const accepted = acceptThemesDir( root, candidate );

		if ( accepted ) {
			return { ...accepted, source, config };
		}
	}

	return null;
};

/**
 * The public URL prefix the built assets are served from. Bedrock serves
 * `web/` as the docroot, so `web/app/themes` becomes `/app/themes`.
 */
const detectThemesBaseUrl = ( { root, themesDir, themesRelDir, config } ) => {
	if ( config.themesBaseUrl ) {
		return { themesBaseUrl: config.themesBaseUrl, docRoot: null };
	}

	let current = path.dirname( themesDir );

	while ( current.startsWith( root ) && current !== path.dirname( current ) ) {
		const isDocRoot = DOCROOT_MARKERS.some( ( marker ) =>
			isFile( path.join( current, marker ) )
		);

		if ( isDocRoot ) {
			return {
				docRoot: current,
				themesBaseUrl:
					'/' + toPosix( path.relative( current, themesDir ) ),
			};
		}

		if ( current === root ) {
			break;
		}

		current = path.dirname( current );
	}

	/**
	 * No docroot marker found — strip a leading segment only when it is a
	 * conventional docroot name. This reproduces the historical `/app/themes`
	 * for `web/app/themes`.
	 */
	const segments = toPosix( themesRelDir ).split( '/' );
	const baseSegments =
		segments.length > 1 && DOCROOT_DIR_NAMES.includes( segments[ 0 ] )
			? segments.slice( 1 )
			: segments;

	return { docRoot: null, themesBaseUrl: '/' + baseSegments.join( '/' ) };
};

const readTheme = ( { themesDir, root, name } ) => {
	const dir = path.join( themesDir, name );
	const header = readHead( path.join( dir, 'style.css' ) );
	const template = readStyleHeaderField( header, 'Template' );
	const relDir = path.relative( root, dir );

	return {
		name,
		dir,
		relDir,
		relDirPosix: toPosix( relDir ),
		title: readStyleHeaderField( header, 'Theme Name' ) || name,
		template,
		isParent: ! template,
	};
};

const pickDefaultTheme = ( { themes, config } ) => {
	if (
		config.defaultTheme &&
		themes.some( ( theme ) => theme.name === config.defaultTheme )
	) {
		return config.defaultTheme;
	}

	const parents = themes.filter( ( theme ) => theme.isParent );

	if ( parents.length === 1 ) {
		return parents[ 0 ].name;
	}

	if ( parents.some( ( theme ) => theme.name === 'sage' ) ) {
		return 'sage';
	}

	const fallback = ( parents[ 0 ] || themes[ 0 ] )?.name;

	if ( parents.length > 1 ) {
		warnOnce(
			'ambiguous-default-theme',
			`Multiple parent themes found (${ parents
				.map( ( theme ) => theme.name )
				.join(
					', '
				) }). Falling back to "${ fallback }". Set "defaultTheme" in ${ CONFIG_FILENAME } or the "${ PACKAGE_JSON_KEY }" key of package.json to choose explicitly.`
		);
	}

	return fallback;
};

const buildThemeRootContext = ( cwd ) => {
	const name = path.basename( cwd );
	const theme = {
		name,
		dir: cwd,
		relDir: '.',
		relDirPosix: '.',
		title: readStyleHeaderField(
			readHead( path.join( cwd, 'style.css' ) ),
			'Theme Name'
		),
		template: null,
		isParent: true,
	};

	return {
		mode: 'theme-root',
		source: 'style.css',
		projectRoot: cwd,
		themesDir: path.dirname( cwd ),
		themesRelDir: '.',
		themesRelDirPosix: '.',
		docRoot: null,
		themesBaseUrl: '/wp-content/themes',
		themes: [ theme ],
		parents: [ theme ],
		defaultTheme: name,
		themeDir: () => cwd,
		themeRelDir: () => '.',
		themeRelDirPosix: () => '.',
		themeForPath: () => theme,
	};
};

const buildBraveRootContext = ( root, detected ) => {
	const { dir: themesDir, relDir: themesRelDir, source, config } = detected;

	const themes = listThemeDirNames( themesDir ).map( ( name ) =>
		readTheme( { themesDir, root, name } )
	);

	const { docRoot, themesBaseUrl } = detectThemesBaseUrl( {
		root,
		themesDir,
		themesRelDir,
		config,
	} );

	const byName = new Map( themes.map( ( theme ) => [ theme.name, theme ] ) );

	return {
		mode: 'brave-root',
		source,
		projectRoot: root,
		themesDir,
		themesRelDir,
		themesRelDirPosix: toPosix( themesRelDir ),
		docRoot,
		themesBaseUrl,
		themes,
		parents: themes.filter( ( theme ) => theme.isParent ),
		defaultTheme: pickDefaultTheme( { themes, config } ),
		themeDir: ( name ) => path.join( themesDir, name ),
		themeRelDir: ( name ) => path.join( themesRelDir, name ),
		themeRelDirPosix: ( name ) =>
			path.posix.join( toPosix( themesRelDir ), name ),
		themeForPath: ( target ) => {
			const absolute = path.resolve( root, target );

			for ( const theme of themes ) {
				if (
					absolute === theme.dir ||
					absolute.startsWith( theme.dir + path.sep )
				) {
					return theme;
				}
			}

			return null;
		},
		getTheme: ( name ) => byName.get( name ) || null,
	};
};

const buildContext = ( cwd ) => {
	const detected = detectThemesDir( cwd );

	if ( detected ) {
		return buildBraveRootContext( cwd, detected );
	}

	if ( isFile( path.join( cwd, 'style.css' ) ) ) {
		return buildThemeRootContext( cwd );
	}

	return null;
};

/**
 * Resolves the project context, memoized per starting directory.
 *
 * The starting directory is injectable because `process.cwd()` is unreliable
 * in long-lived editor processes — the VSCode extension host reports `/` when
 * the editor was launched from the Dock.
 */
const resolveThemeContext = ( { cwd = process.cwd() } = {} ) => {
	const root = path.resolve( cwd );

	if ( cache.has( root ) ) {
		return cache.get( root );
	}

	const context = buildContext( root );

	if ( ! context ) {
		throw new Error(
			`Unable to determine project context from "${ root }": no themes ` +
				`directory (tried ${ THEMES_DIR_CANDIDATES.join(
					', '
				) }) and no "style.css". Run from a project root or a theme ` +
				`directory, or set "themesDir" in ${ CONFIG_FILENAME } or the ` +
				`"${ PACKAGE_JSON_KEY }" key of package.json.`
		);
	}

	cache.set( root, context );

	return context;
};

/**
 * Non-throwing variant, for configs loaded inside editor processes where a
 * throw at require time would take down formatting or linting entirely.
 */
const tryResolveThemeContext = ( options ) => {
	try {
		return resolveThemeContext( options );
	} catch {
		return null;
	}
};

const getAllThemeNames = ( options ) =>
	resolveThemeContext( options ).themes.map( ( theme ) => theme.name );

const getParentThemes = ( options ) => resolveThemeContext( options ).parents;

const getThemesBaseUrl = ( options ) =>
	resolveThemeContext( options ).themesBaseUrl;

const clearThemeContextCache = () => {
	cache.clear();
	warned.clear();
};

module.exports = {
	clearThemeContextCache,
	getAllThemeNames,
	getParentThemes,
	getThemesBaseUrl,
	resolveThemeContext,
	tryResolveThemeContext,
};
