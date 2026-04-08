import { createBasePackageConfig } from './base-package.js';

export const laravelPackageConfig = ( options = {} ) =>
	createBasePackageConfig( {
		outDir: 'public/build',
		formats: [ 'es', 'cjs' ],
		manifest: true,
		...options,
	} );
