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

	const fragments = Object.fromEntries(
		fs
			.readdirSync( fragmentDir )
			.filter( ( file ) => file.endsWith( '.json' ) )
			.map( ( file ) => [
				path.basename( file, '.json' ),
				JSON.parse(
					fs.readFileSync( path.join( fragmentDir, file ), 'utf8' )
				),
			] )
	);

	fs.writeFileSync(
		path.join( outDir, 'assets.json' ),
		JSON.stringify( { entries: { ...entries, ...fragments } }, null, 2 ) +
			'\n'
	);
	fs.rmSync( fragmentDir, { recursive: true, force: true } );
};
