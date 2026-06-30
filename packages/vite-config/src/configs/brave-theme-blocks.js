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
import { createViteBlock } from '@yardinternet/vite-plugin-gutenberg-blocks';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Internal dependencies
 */
import { generateAliases } from '../utils/generate-aliases.js';
import { getAllThemeNames } from '../utils/get-all-theme-names.js';
import { resolveThemeContext } from '../utils/resolve-theme-context.js';

export const braveBlocksConfig = ( { blockPath } ) => {
	const context = resolveThemeContext();
	const entryDir = blockPath;

	/**
	 * Block output directory:
	 * - theme-root: the theme's own `public` directory.
	 * - brave-root: the owning theme's public directory, derived from the
	 *   `web/app/themes/<theme>/...` block path.
	 */
	const outDir =
		context.mode === 'theme-root'
			? 'public'
			: path.join(
					'web/app/themes',
					blockPath.split( path.sep ).at( 3 ),
					'public'
			  );
	const allThemes = getAllThemeNames();

	return defineConfig( {
		/**
		 * Blocks don't ship a static public directory. Disabling it also avoids
		 * a self-copy in theme-root, where the cwd's `public` dir (the build
		 * target) would otherwise be Vite's default publicDir and collide with
		 * the per-block outDir nested inside it.
		 */
		publicDir: false,
		resolve: {
			alias: generateAliases( allThemes ),
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
