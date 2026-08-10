'use strict';

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

// Add all transforms to the array here.
const allTransforms = [ require( './transforms/disable-sass-charset' ) ];

module.exports = allTransforms.reduce(
	( config, transform ) => transform( config ),
	defaultConfig
);
