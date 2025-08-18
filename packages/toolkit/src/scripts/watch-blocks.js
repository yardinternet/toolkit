/**
 * External dependencies
 */
import { spawn } from 'child_process';
import path from 'path';

/**
 * Internal dependencies
 */
import { getBlockPaths } from '../utils/get-block-paths.js';
import { ensureFileExists, setupGracefulShutdown } from '../utils/helpers.js';
import log from '../utils/logger.js';

export const watchBlocks = async ( configFile = 'vite-blocks.config.js' ) => {
	ensureFileExists(
		configFile,
		`❌ ${ configFile } not found in the project root.`
	);

	const blocks = await getBlockPaths();

	if ( blocks.length === 0 ) {
		log.error( 'No blocks found to watch.', true, 0 );
	}

	const children = [];

	blocks.forEach( ( blockPath ) => {
		const blockName = path.basename( blockPath );
		const themeName = blockPath.split( path.sep ).at( 3 ); // web/app/themes/<themeName>...

		log.info( `Watching block: ${ blockName } (${ themeName })` );

		const child = spawn(
			'vite',
			[ 'build', '--emptyOutDir', '--watch', '--config', configFile ],
			{
				env: {
					...process.env,
					BLOCK_PATH: blockPath,
					FORCE_COLOR: true,
				},
				stdio: 'inherit', // stream output directly to terminal
				shell: true,
			}
		);

		children.push( child );

		child.on( 'error', ( err ) => {
			log.error(
				`Failed to start watcher for ${ blockPath }: ${ err.message }`
			);
		} );
	} );

	setupGracefulShutdown( children );
};
