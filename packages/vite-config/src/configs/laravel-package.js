import { createBasePackageConfig } from './base-package.js';

export const laravelPackageConfig = ( options = {} ) =>
	createBasePackageConfig( {
		outDir: 'public',
		minify: true,
		publicDir: false,
		...options,
	} );
