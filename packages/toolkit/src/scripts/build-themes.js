/**
 * Internal dependencies
 */
import { getAllThemeNames } from '@yardinternet/shared-utils';
import {
	ensureFileExists,
	execWithEnv,
	handleParallelResults,
	mapWithConcurrency,
} from '../utils/helpers.js';
import log from '../utils/logger.js';

export const buildThemes = async ( configFile = 'vite.config.js' ) => {
	ensureFileExists(
		configFile,
		`❌ ${ configFile } not found in the project root.`
	);

	const themes = getAllThemeNames();

	if ( themes.length === 0 ) {
		log.error( 'No themes found to build.', true, 0 );
	}

	const results = await mapWithConcurrency( themes, async ( theme ) => {
		log.info( `Building theme: ${ theme }` );
		try {
			const { stdout } = await execWithEnv(
				`vite build --config ${ configFile }`,
				{
					THEME: theme,
					FORCE_COLOR: true,
				}
			);
			log.info( stdout );
			log.info( `Theme ${ theme } built successfully.` );
		} catch ( err ) {
			const stderr = err.stderr || err.message || 'Unknown error';
			log.error( `Error building theme ${ theme }:\n${ stderr }` );
			throw err;
		}
	} );

	handleParallelResults( results, 'theme' );
};
