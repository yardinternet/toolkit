/**
 * Internal dependencies
 */
import { getThemeNames } from '../utils/get-theme-names.js';
import {
	ensureFileExists,
	execWithEnv,
	handleParallelResults,
} from '../utils/helpers.js';
import log from '../utils/logger.js';

export const buildThemes = async ( configFile = 'vite.config.js' ) => {
	ensureFileExists(
		configFile,
		`❌ ${ configFile } not found in the project root.`
	);

	const themes = getThemeNames();

	if ( themes.length === 0 ) {
		log.error( 'No themes found to build.', true, 0 );
	}

	Promise.allSettled(
		themes.map( async ( theme ) => {
			log.info( `Building theme: ${ theme }` );
			try {
				const { stdout } = await execWithEnv( `vite build`, {
					THEME: theme,
					FORCE_COLOR: true,
				} );
				log.info( stdout );
				log.info( `Theme ${ theme } built successfully.` );
			} catch ( err ) {
				const stderr = err.stderr || err.message || 'Unknown error';
				log.error( `Error building theme ${ theme }:\n${ stderr }` );
				throw err;
			}
		} )
	).then( ( results ) => {
		handleParallelResults( results, 'theme' );
	} );
};
