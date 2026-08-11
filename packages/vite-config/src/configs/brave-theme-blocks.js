/**
 * Vite configuration for Brave block theme development.
 *
 * - A Node script runs this config concurrently per theme.
 * - Processes each theme's `resources/blocks` directory.
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
import {
	getAllThemeNames,
	resolveThemeContext,
} from '@yardinternet/shared-utils';

export const braveBlocksConfig = ( { blockPath } ) => {
	const context = resolveThemeContext();
	const entryDir = blockPath;

	/**
	 * Block output directory:
	 * - theme-root: the theme's own `public` directory.
	 * - brave-root: the public directory of the theme owning the block path.
	 */
	const owningTheme = context.themeForPath( blockPath );

	if ( ! owningTheme ) {
		throw new Error(
			`Unable to determine the theme owning block path "${ blockPath }".`
		);
	}

	const outDir =
		context.mode === 'theme-root'
			? 'public'
			: path.join( owningTheme.relDir, 'public' );
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
