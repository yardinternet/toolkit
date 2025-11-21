import postcssPrefixWrap from 'postcss-prefixwrap';

/**
 * Conditionally returns the PostCSS Prefix Wrap plugin. This plugin is used to wrap editor styles
 * inside a .editor-styles-wrapper class based on the provided entrypooints. Some selectors are ignored
 * because they need to remain global.
 */
export function getPostCssPrefixWrapPlugin( config = {} ) {
	if ( ! Array.isArray( config?.entryPoints ) ) {
		return [];
	}

	return [
		postcssPrefixWrap( '.editor-styles-wrapper', {
			ignoredSelectors: [
				':root',
				/^(body)(.+)$/,
				/^(.editor-styles-wrapper)(.+)$/,
			],
			prefixRootTags: false,
			whitelist: config.entryPoints,
		} ),
	];
}
