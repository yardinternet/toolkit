/**
 * Vite configuration for Brave block theme development.
 *
 * - A Node script runs this config concurrently per theme.
 * - Processes `web/app/themes/<theme>/resources/blocks` directory.
 * - Uses the theme's public directory for output, in watch and build modes.
 */

/**
 * External dependencies
 */
import { defineConfig } from 'vite';
import { createViteBlock } from 'vite-plugin-gutenberg-blocks';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Internal dependencies
 */
import { generateAliases } from '../utils/generate-aliases.js';

export const braveBlocksConfig = ( { blockPath } ) => {
	const entryDir = blockPath;
	const themeName = blockPath.split( path.sep ).at( 3 ); // assumes: web/app/themes/<theme>/...
	const outDir = path.join( 'web/app/themes', themeName, 'public' );

	return defineConfig( {
		resolve: {
			alias: generateAliases(),
		},
		plugins: [
			createViteBlock( {
				entryDir,
				outDir,
			} ),
			tailwindcss(),
		],
	} );
};
