/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

/**
 * Merges the per-entry fragments each Vite build writes into a single map.
 *
 * Builds run in parallel, so each one emits its own file rather than
 * read-modify-writing a shared one. This also preserves entries that a
 * partial (watch) rebuild did not touch.
 */
export const writeEntryMap = ( outDir = 'public' ) => {
	const fragmentDir = path.join( outDir, '.assets' );

	if ( ! fs.existsSync( fragmentDir ) ) {
		return;
	}

	let entries = {};
	const assetFile = path.join( outDir, 'assets.json' );

	if ( fs.existsSync( assetFile ) ) {
		try {
			const existing = JSON.parse( fs.readFileSync( assetFile, 'utf8' ) );
			entries = existing.entries || {};
		} catch {
			// Ignore malformed or unparseable file
		}
	}

	const files = fs
		.readdirSync( fragmentDir )
		.filter( ( file ) => file.endsWith( '.json' ) );

	for ( const file of files ) {
		const fragmentPath = path.join( fragmentDir, file );

		/*
		 * The watch timer can read a fragment Vite is mid-write. Throwing here
		 * would kill the watcher and orphan its vite children, so an unparseable
		 * fragment is left on disk for the next tick instead.
		 */
		try {
			entries[ path.basename( file, '.json' ) ] = JSON.parse(
				fs.readFileSync( fragmentPath, 'utf8' )
			);
			fs.unlinkSync( fragmentPath );
		} catch {
			// Skipped this tick.
		}
	}

	fs.writeFileSync(
		path.join( outDir, 'assets.json' ),
		JSON.stringify( { entries }, null, 2 ) + '\n'
	);

	try {
		fs.rmdirSync( fragmentDir );
	} catch {
		// Still holds a fragment that could not be merged yet.
	}
};
