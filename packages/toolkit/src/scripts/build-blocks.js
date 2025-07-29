/**
 * External dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import { getBlockPaths } from '../utils/get-block-paths.js';
import {
	ensureFileExists,
	execWithEnv,
	handleParallelResults,
} from '../utils/helpers.js';
import log from '../utils/logger.js';

export const buildBlocks = async ( configFile = 'vite-blocks.config.js' ) => {
	ensureFileExists(
		configFile,
		`❌ ${ configFile } not found in the project root.`
	);

	const blocks = await getBlockPaths();

	if ( blocks.length === 0 ) {
		log.error( 'No blocks found to build.', true, 0 );
	}

	Promise.allSettled(
		blocks.map( async ( blockPath ) => {
			const blockName = path.basename( blockPath );
			const themeName = blockPath.split( path.sep ).at( 3 ); // web/app/themes/<themeName>...

			log.info( `Building block: ${ blockName } (${ themeName })` );

			try {
				const { stdout } = await execWithEnv(
					`vite build --emptyOutDir --config vite-blocks.config.js`,
					{
						BLOCK_PATH: blockPath,
						FORCE_COLOR: true,
					}
				);
				log.info( stdout );
				log.info( `Block ${ blockName } built successfully.` );
			} catch ( err ) {
				const stderr = err.stderr || err.message || 'Unknown error';
				log.error(
					`Error building block ${ blockName }:\n${ stderr }`
				);
				throw err;
			}
		} )
	).then( ( results ) => {
		handleParallelResults( results, 'block' );
	} );
};
