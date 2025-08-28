/**
 * Vite configuration for Brave multi site theme development.
 *
 * Behavior depends on the mode:
 *
 * Development Mode:
 * - Starts a single dev server.
 * - Automatically processes all themes.
 * - Uses `web/app/themes/sage/public` as the public directory.
 *
 * Build Mode:
 * - A Node script runs this config concurrently per theme.
 * - Processes only the specified theme.
 * - Uses the specific theme’s public directory for output.
 */

/**
 * External dependencies
 */
import { defineConfig, loadEnv } from 'vite';
import { wordpressPlugin } from '@roots/vite-plugin';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

/**
 * Internal dependencies
 */
import { generateAliases } from '../utils/generate-aliases.js';
import { generateEntryPoints } from '../utils/generate-entry-points.js';
import { getAllThemeNames } from '../utils/get-all-theme-names.js';

export const braveConfig = ( { theme = 'sage', entryPoints, mode } ) => {
	const env = loadEnv( mode, process.cwd(), '' );
	const isDev = ! process.argv.includes( 'build' );
	const allThemes = getAllThemeNames();

	/**
	 * Determine which themes to process:
	 * - In dev mode: include all themes for a unified dev server
	 * - In build mode: only process the single specified theme
	 */
	const themesToProcess = isDev ? allThemes : [ theme ];

	return defineConfig( {
		base: isDev ? '' : `/app/themes/${ theme }/public/build/`,
		/**
		 * Named host required for CSP whitelisting in dev mode.
		 */
		server: {
			hmr: {
				host: 'localhost',
			},
			/**
			 * Allow CORS requests from the WordPress WP_HOME env variable. Regex to allow subdomains.
			 */
			cors: {
				origin: new RegExp(
					`https?:\/\/(.*\\.)?${ env.WP_HOME.replace(
						/^https?:\/\//,
						''
					) }$`
				),
			},
		},
		/**
		 * Generates the aliases for each theme to use like `@theme-name`.
		 */
		resolve: {
			alias: generateAliases( allThemes ),
		},
		/**
		 * Do not pre-bundle these packages and serve as-is. If we do not do this, Vite pre-bundles these dependencies, causing issues with the import of @wordpress/* packages.
		 *
		 * @see https://github.com/roots/vite-plugin/issues/13#issuecomment-2795161910
		 */
		optimizeDeps: {
			exclude: [
				'@yardinternet/gutenberg-components',
				'@yardinternet/gutenberg-hooks',
			],
		},
		plugins: [
			wordpressPlugin(),
			tailwindcss(),
			laravel( {
				/**
				 * Entrypoints:
				 * - Dev mode: all themes
				 * - Build mode: only the theme passed to this config
				 */
				input: generateEntryPoints( {
					themesToProcess,
					entryPoints,
				} ),
				/**
				 * Public directory:
				 * - Dev mode: Sage (assumes it hosts the dev server)
				 * - Build mode: output to the specific theme directory
				 */
				publicDirectory: `web/app/themes/${ theme }/public`,
				/**
				 * Files to watch for changes and trigger a refresh
				 */
				refresh: [ `web/app/themes/**/resources/views/**/*.blade.php` ],
			} ),
		],
		css: {
			devSourcemap: true,
		},
	} );
};
