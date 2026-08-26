export const entryMapPlugin = ( { entry } ) => ( {
	name: 'yard-entry-map',
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
				css: [ ...( chunk?.viteMetadata?.importedCss ?? [] ) ],
				deps: [ ...new Set( deps ) ].sort(),
			} ),
		} );
	},
} );
