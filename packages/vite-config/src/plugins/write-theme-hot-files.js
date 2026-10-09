/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

/**
 * Writes the dev server's public/hot file out to every theme.
 */
const MAX_ATTEMPTS = 20;
const RETRY_DELAY = 50;

/**
 * Module scope, so a server restart still cleans up the files the previous one wrote.
 */
const written = new Set();
let exitHandlersBound = false;

const clean = () => {
	for ( const target of written ) {
		try {
			fs.rmSync( target );
		} catch {
			// Already gone, or never created
		}
	}

	written.clear();
};

export const writeThemeHotFiles = ( { context, sourceHotFile } ) => {
	return {
		name: 'yard:write-theme-hot-files',
		apply: 'serve',
		config: () => ( {
			server: {
				watch: {
					ignored: [ '**/public/hot' ],
				},
			},
		} ),
		configureServer( server ) {
			const fanOut = ( attempt = 0 ) => {
				if ( ! fs.existsSync( sourceHotFile ) ) {
					if ( attempt < MAX_ATTEMPTS ) {
						setTimeout( () => fanOut( attempt + 1 ), RETRY_DELAY );

						return;
					}

					server.config.logger.warn(
						`[yard] No hot file at ${ sourceHotFile }; themes cannot resolve the dev server.`
					);

					return;
				}

				const contents = fs.readFileSync( sourceHotFile, 'utf-8' );

				context.themes.forEach( ( theme ) => {
					const target = path.join( theme.dir, 'public', 'hot' );

					if (
						path.resolve( target ) === path.resolve( sourceHotFile )
					) {
						return;
					}

					try {
						fs.mkdirSync( path.dirname( target ), {
							recursive: true,
						} );
						fs.writeFileSync( target, contents );
						written.add( target );
						server.watcher.unwatch( target );
					} catch ( error ) {
						server.config.logger.warn(
							`[yard] Could not write hot file for theme "${ theme.name }": ${ error.message }`
						);
					}
				} );
			};

			/**
			 * laravel-vite-plugin writes the hot file from its own `listening` handler and is `enforce: 'post'`, so plugin order does not guarantee it ran first. Deferring past the current tick does.
			 */
			server.httpServer?.once( 'listening', () =>
				setImmediate( () => fanOut() )
			);

			/**
			 * Vite restarts the server on config changes, running this hook again.
			 */
			if ( exitHandlersBound ) {
				return;
			}

			process.on( 'exit', clean );
			process.on( 'SIGINT', () => process.exit() );
			process.on( 'SIGTERM', () => process.exit() );
			process.on( 'SIGHUP', () => process.exit() );
			exitHandlersBound = true;
		},
	};
};
