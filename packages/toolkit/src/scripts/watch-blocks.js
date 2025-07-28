/**
 * External dependencies
 */
import { spawn } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';

/**
 * Internal dependencies
 */
import { getBlockPaths } from '../utils/get-block-paths.js';

export const watchBlocks = async ( configFile = 'vite-blocks.config.js' ) => {
	if ( ! fs.existsSync( configFile ) ) {
		console.error(
			chalk.red( `❌ ${ configFile } not found in the project root.` )
		);
		process.exit( 1 );
	}

	const blocks = await getBlockPaths();

	if ( blocks.length === 0 ) {
		console.log( chalk.red( 'No blocks found to watch.' ) );
		process.exit( 0 );
	}
	console.log(
		chalk.blue( `\n🔍 Detected blocks:\n${ blocks.join( '\n' ) }\n` )
	);

	const children = [];

	blocks.forEach( ( block ) => {
		console.log( chalk.bold.blue( `[●] Watching block: ${ block }` ) );

		const child = spawn(
			'vite',
			[
				'build',
				'--emptyOutDir',
				'--watch',
				'--config',
				'vite-blocks.config.js',
			],
			{
				env: {
					...process.env,
					BLOCK_PATH: block,
					FORCE_COLOR: true,
				},
				stdio: 'inherit', // stream output directly to terminal
				shell: true,
			}
		);

		children.push( child );

		child.on( 'error', ( err ) => {
			console.error(
				chalk.red(
					`❌ Failed to start watcher for ${ block }: ${ err.message }`
				)
			);
		} );
	} );

	// Gracefully handle SIGINT (Ctrl+C) to avoid zombie processes
	process.on( 'SIGINT', () => {
		children.forEach( ( child ) => {
			if ( child && ! child.killed ) {
				child.kill( 'SIGINT' );
			}
		} );

		process.exit( 0 );
	} );
};
