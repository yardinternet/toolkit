import { createBasePackageConfig } from './base-package.js';

export const laravelPackageConfig = ( options = {} ) =>
	createBasePackageConfig( {
		outDir: 'public/build', // TODO: do we need to really use build here? maybe just public?
		formats: [ 'es', 'cjs' ],
		manifest: true,
		...options,
	} );
