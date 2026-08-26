/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

/**
 * Merges the per-entry fragments each Vite build writes into a single map.
 *
 * Builds run in parallel, so each one emits its own file rather than
 * read-modify-writing a shared one.
 */
export const writeEntryMap = ( outDir = 'public' ) => {
	const fragmentDir = path.join( outDir, '.assets' );

	if ( ! fs.existsSync( fragmentDir ) ) {
		return;
	}

	const entries = Object.fromEntries(
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
		JSON.stringify( { entries }, null, 2 ) + '\n'
	);
	fs.rmSync( fragmentDir, { recursive: true, force: true } );
};
