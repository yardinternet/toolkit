/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

export const getThemeNames = () => {
	const themesDir = path.resolve( 'web/app/themes' );

	if ( ! fs.existsSync( themesDir ) ) {
		console.error( 'Themes directory does not exist' );
		return [];
	}

	return fs.readdirSync( themesDir ).filter( ( dirName ) => {
		const fullPath = path.join( themesDir, dirName );

		try {
			const isDirectory = fs.statSync( fullPath ).isDirectory();

			if ( ! isDirectory ) return false;

			// Check if the directory contains a style.css file
			const hasStyleCss = fs.existsSync(
				path.join( fullPath, 'style.css' )
			);
			return hasStyleCss;
		} catch {
			console.error( `Error checking directory: ${ fullPath }` );
			return false;
		}
	} );
};
