import checker from 'vite-plugin-checker';

/**
 * Returns the vite-plugin-checker plugin if a valid config is provided.
 */
export const getCheckerPlugin = ( { checkerOption } ) => {
	if ( ! checkerOption ) return [];

	if ( typeof checkerOption !== 'object' ) {
		throw new Error(
			'[braveConfig] checker must be an object e.g. { typescript: true, eslint: { files: "./src" } })'
		);
	}

	return [ checker( checkerOption ) ];
};
