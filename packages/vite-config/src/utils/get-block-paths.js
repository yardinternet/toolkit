/**
 * External dependencies
 */
import fs from 'fs/promises';
import path from 'path';

/**
 * Internal dependencies
 */
import { getThemeNames } from './get-theme-names.js';

export const getBlockPaths = async () => {
	const themeNames = getThemeNames();

	const blockPathsPerTheme = await Promise.all(
		themeNames.map( async ( themeName ) => {
			const blocksDir = path.join(
				'web/app/themes',
				themeName,
				'resources/scripts/blocks'
			);

			try {
				const blockEntries = await fs.readdir( blocksDir, {
					withFileTypes: true,
				} );

				const validBlockPaths = await Promise.all(
					blockEntries.map( async ( entry ) => {
						if ( ! entry.isDirectory() ) return null;

						const blockPath = path.join( blocksDir, entry.name );
						const blockJsonPath = path.join(
							blockPath,
							'block.json'
						);

						try {
							await fs.access( blockJsonPath );
							return blockPath;
						} catch {
							// block.json does not exist — skip
							return null;
						}
					} )
				);

				// Filter out nulls
				return validBlockPaths.filter( Boolean );
			} catch {
				// Theme may not have a blocks dir — skip
				return [];
			}
		} )
	);

	// Flatten array of arrays
	return blockPathsPerTheme.flat();
};
