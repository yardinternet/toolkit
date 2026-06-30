/**
 * External dependencies
 */
import fs from 'fs/promises';
import path from 'path';

/**
 * Internal dependencies
 */
import { resolveThemeContext } from './resolve-theme-context.js';

export const getBlockPaths = async () => {
	const context = resolveThemeContext();

	const blockPathsPerTheme = await Promise.all(
		context.themes.map( async ( theme ) => {
			const blocksDir = path.join(
				theme.relDir,
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
