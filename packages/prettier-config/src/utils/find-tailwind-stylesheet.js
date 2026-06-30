const fs = require( 'fs' );
const path = require( 'path' );

function findTailwindStylesheet() {
	// Candidate locations of the Tailwind config stylesheet, tried in order:
	// - brave-root: the sage theme inside `web/app/themes`.
	// - theme-root: the theme's own resources (cwd is the theme).
	const relatives = [
		'web/app/themes/sage/resources/styles/base/config.css',
		'resources/styles/base/config.css',
	];

	const roots = [];

	// 1. PWD / VSCODE_CWD env vars — set to the project root by the shell and
	//    VSCode, and unlike process.cwd() they survive being reset to '/'.
	if ( process.env.VSCODE_CWD ) roots.push( process.env.VSCODE_CWD );
	if ( process.env.PWD ) roots.push( process.env.PWD );

	// 2. Installed normally (no symlink): strip at the first node_modules boundary.
	const nmIndex = __dirname.indexOf( 'node_modules' );
	if ( nmIndex > 0 ) {
		roots.push( __dirname.substring( 0, nmIndex - 1 ) );
	}

	// 3. process.cwd() — correct for standard CLI runs.
	roots.push( process.cwd() );

	for ( const root of roots ) {
		for ( const relative of relatives ) {
			const candidate = path.resolve( root, relative );
			if ( fs.existsSync( candidate ) ) return candidate;
		}
	}

	return null;
}

module.exports = findTailwindStylesheet;
