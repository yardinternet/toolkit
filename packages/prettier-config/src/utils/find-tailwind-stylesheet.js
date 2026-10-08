const fs = require( 'fs' );
const path = require( 'path' );
const { tryResolveThemeContext } = require( '@yardinternet/shared-utils' );

const STYLESHEET_RELATIVE = path.join(
	'resources',
	'styles',
	'base',
	'config.css'
);

/**
 * Candidate project roots, most reliable first.
 *
 * The node_modules boundary comes first because it is the only anchor that
 * survives the VSCode Prettier extension: the extension host's `process.cwd()`
 * is `/` when the editor was launched from the Dock, and `VSCODE_CWD` is the
 * cwd of whatever launched the editor — which points at the wrong project as
 * soon as two projects are open. Installed as a dependency this package always
 * lives under the project's own `node_modules`.
 */
const projectRoots = () => {
	const roots = [];
	const nmIndex = __dirname.indexOf(
		`${ path.sep }node_modules${ path.sep }`
	);

	if ( nmIndex > 0 ) {
		roots.push( __dirname.substring( 0, nmIndex ) );
	}

	if ( process.env.VSCODE_CWD ) {
		roots.push( process.env.VSCODE_CWD );
	}

	if ( process.env.PWD ) {
		roots.push( process.env.PWD );
	}

	roots.push( process.cwd() );

	return [ ...new Set( roots ) ];
};

const existingFile = ( candidate ) => {
	try {
		return fs.statSync( candidate ).isFile() ? candidate : null;
	} catch {
		return null;
	}
};

/**
 * Resolves the project context once, from the first root that yields one.
 */
const resolveContext = () => {
	for ( const root of projectRoots() ) {
		const context = tryResolveThemeContext( { cwd: root } );

		if ( context ) {
			return context;
		}
	}

	return null;
};

const themeStylesheet = ( theme ) =>
	existingFile( path.join( theme.dir, STYLESHEET_RELATIVE ) );

/**
 * The Tailwind config stylesheet used for files outside any theme directory.
 *
 * Prefers the default theme, then any other theme that has one.
 */
const findTailwindStylesheet = () => {
	const context = resolveContext();

	if ( context ) {
		const ordered = [
			...context.themes.filter(
				( theme ) => theme.name === context.defaultTheme
			),
			...context.themes.filter(
				( theme ) => theme.name !== context.defaultTheme
			),
		];

		for ( const theme of ordered ) {
			const stylesheet = themeStylesheet( theme );

			if ( stylesheet ) {
				return stylesheet;
			}
		}
	}

	// No resolvable project layout — fall back to the historical locations.
	for ( const root of projectRoots() ) {
		const legacy =
			existingFile(
				path.join( root, 'web/app/themes/sage', STYLESHEET_RELATIVE )
			) || existingFile( path.join( root, STYLESHEET_RELATIVE ) );

		if ( legacy ) {
			return legacy;
		}
	}

	return null;
};

/**
 * Per-theme stylesheets, used to build Prettier `overrides` so a file is sorted
 * against its own theme's Tailwind config rather than a single project-wide one.
 */
const findThemeStylesheets = () => {
	const context = resolveContext();

	if ( ! context || context.themes.length < 2 ) {
		return [];
	}

	return context.themes
		.map( ( theme ) => ( {
			dir: theme.dir,
			stylesheet: themeStylesheet( theme ),
		} ) )
		.filter( ( theme ) => theme.stylesheet );
};

module.exports = { findTailwindStylesheet, findThemeStylesheets };
