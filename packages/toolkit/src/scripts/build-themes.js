/**
 * External dependencies
 */
import { exec } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import util from 'util';

/**
 * Internal dependencies
 */
import { getThemeNames } from '../utils/get-theme-names.js';

export const buildThemes = async ( configFile = 'vite.config.js' ) => {
	const execAsync = util.promisify( exec );

	if ( ! fs.existsSync( configFile ) ) {
		console.error(
			chalk.red( `❌ ${ configFile } not found in the project root.` )
		);
		process.exit( 1 );
	}

	const themes = getThemeNames();

	if ( themes.length === 0 ) {
		console.log( chalk.red( 'No themes found to build.' ) );
		process.exit( 0 );
	}

	console.log(
		chalk.blue( `\n🔍 Detected themes: ${ themes.join( ', ' ) }\n` )
	);

	// Run builds in parallel
	Promise.allSettled(
		themes.map( async ( theme ) => {
			console.log( chalk.bold.blue( `[●] Building theme: ${ theme }` ) );

			try {
				const { stdout } = await execAsync(
					`THEME=${ theme } vite build`,
					{
						env: {
							...process.env,
							THEME: theme,
							FORCE_COLOR: true,
						},
					}
				);

				console.log( stdout );
				console.log(
					chalk.green( `[✔] Theme ${ theme } built successfully.\n` )
				);
			} catch ( error ) {
				const stderr = error.stderr || error.message || 'Unknown error';
				console.error(
					chalk.red(
						`[✖] Error building theme ${ theme }:\n${ stderr }\n`
					)
				);

				throw error;
			}
		} )
	).then( ( results ) => {
		const failed = results.filter( ( r ) => r.status === 'rejected' );

		if ( failed.length > 0 ) {
			console.error(
				chalk.red.bold(
					`❌ ${ failed.length } theme(s) failed to build.\n`
				)
			);
			process.exit( 1 );
		} else {
			console.log(
				chalk.green.bold( '✅ All themes built successfully.\n' )
			);
		}
	} );
};
