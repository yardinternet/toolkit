/**
 * External dependencies
 */
import { exec } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import util from 'util';
import path from 'path';

/**
 * Internal dependencies
 */
import { getBlockPaths } from '../utils/get-block-paths.js';

export const buildBlocks = async ( configFile = 'vite-blocks.config.js' ) => {
	const execAsync = util.promisify( exec );

	if ( ! fs.existsSync( configFile ) ) {
		console.error(
			chalk.red( `❌ ${ configFile } not found in the project root.` )
		);
		process.exit( 1 );
	}

	const blocks = await getBlockPaths();

	if ( blocks.length === 0 ) {
		console.log( chalk.red( 'No blocks found to build.' ) );
		process.exit( 0 );
	}
	console.log(
		chalk.blue( `\n🔍 Detected blocks:\n${ blocks.join( '\n' ) }\n` )
	);

	Promise.allSettled(
		blocks.map( async ( blockPath ) => {
			const blockName = path.basename( blockPath );
			const themeName = blockPath.split( path.sep ).at( 3 ); // web/app/themes/<themeName>...

			console.log(
				chalk.bold.blue(
					`[●] Building block: ${ blockName } (${ themeName })`
				)
			);

			try {
				const { stdout } = await execAsync(
					`BLOCK_PATH=${ blockPath } vite build --emptyOutDir --config vite-blocks.config.js`,
					{
						env: {
							...process.env,
							BLOCK_PATH: blockPath,
							FORCE_COLOR: true,
						},
					}
				);

				console.log( stdout );
				console.log(
					chalk.green(
						`[✔] Block ${ blockName } built successfully.\n`
					)
				);
			} catch ( error ) {
				const stderr = error.stderr || error.message || 'Unknown error';
				console.error(
					chalk.red(
						`[✖] Error building block ${ blockName }:\n${ stderr }\n`
					)
				);
				throw error;
			}
		} )
	).then( ( results ) => {
		const failed = results.filter( ( r ) => r.status === 'rejected' );
		if ( failed.length > 0 ) {
			console.error(
				chalk.red( `\n❌ ${ failed.length } blocks failed to build.` )
			);
			process.exit( 1 );
		} else {
			console.log( chalk.green( '✅ All blocks built successfully!' ) );
		}
	} );
};
