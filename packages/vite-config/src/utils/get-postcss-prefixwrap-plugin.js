import postcssPrefixWrap from 'postcss-prefixwrap';

const DEFAULT_IGNORED_SELECTORS = [
	':root',
	/^body.+$/,
	/^\.editor-styles-wrapper.+$/,
];

/**
 * Conditionally returns the PostCSS Prefix Wrap plugin. This plugin is used to wrap editor styles
 * inside a .editor-styles-wrapper class based on the provided entrypoints. Some selectors are ignored
 * because they need to remain global.
 */
export function getPostCssPrefixWrapPlugin( config = {} ) {
	if ( ! Array.isArray( config.entryPoints ) ) {
		return [];
	}

	const ignoredSelectors = Array.isArray( config.ignoredSelectors )
		? [ ...DEFAULT_IGNORED_SELECTORS, ...config.ignoredSelectors ]
		: DEFAULT_IGNORED_SELECTORS;

	return [
		postcssPrefixWrap( '.editor-styles-wrapper', {
			ignoredSelectors,
			prefixRootTags: false,
			whitelist: config.entryPoints,
		} ),
	];
}
