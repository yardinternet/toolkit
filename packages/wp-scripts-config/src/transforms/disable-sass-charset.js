'use strict';

/**
 * Remove the BOM character from the output of sass-loader.
 *
 * @see https://github.com/WordPress/gutenberg/issues/81382
 *
 * @param {Object} config Webpack configuration object.
 * @return {Object} Webpack configuration object with the sass-loader charset option disabled.
 */
module.exports = ( config ) => {
	for ( const rule of config.module?.rules ?? [] ) {
		for ( const use of Array.isArray( rule.use ) ? rule.use : [] ) {
			if ( ! use?.loader?.includes?.( 'sass-loader' ) ) {
				continue;
			}

			use.options = {
				...use.options,
				sassOptions: { ...use.options?.sassOptions, charset: false },
			};
		}
	}

	return config;
};
