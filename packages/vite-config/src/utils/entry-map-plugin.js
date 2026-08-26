export const entryMapPlugin = ( { entry } ) => ( {
	name: 'yard-entry-map',
	/*
	 * Must run after vite:css-post. A single-entry iife build always has
	 * cssCodeSplit off, so Vite never populates chunk.viteMetadata.importedCss
	 * — it combines styles into one asset instead, emitted only once css-post's
	 * own generateBundle has run. The asset itself is the only place left to
	 * find the stylesheet name.
	 */
	enforce: 'post',
	generateBundle( _options, bundle ) {
		const depsKey = Object.keys( bundle ).find(
			( key ) => 'editor.deps.json' === bundle[ key ].name
		);
		const deps = depsKey
			? JSON.parse( bundle[ depsKey ].source.toString() )
			: [];

		const chunk = Object.values( bundle ).find(
			( item ) => 'chunk' === item.type && item.isEntry
		);

		const cssAsset = Object.values( bundle ).find(
			( item ) =>
				'asset' === item.type && item.fileName?.endsWith( '.css' )
		);

		/*
		 * wp-element never reaches the roots plugin's list: the JSX pragma
		 * `wp.element.createElement` is injected by oxc rather than imported, so
		 * nothing resolves @wordpress/element. WordPress silently drops a script
		 * whose dependency is unregistered, so this has to be exact.
		 */
		if ( chunk && /\bwp\.element\b/.test( chunk.code ) ) {
			deps.push( 'wp-element' );
		}

		if ( depsKey ) {
			delete bundle[ depsKey ];
		}

		this.emitFile( {
			type: 'asset',
			fileName: `.assets/${ entry }.json`,
			source: JSON.stringify( {
				js: chunk?.fileName ?? '',
				css: cssAsset ? [ cssAsset.fileName ] : [],
				deps: [ ...new Set( deps ) ].sort(),
			} ),
		} );
	},
} );
