import { createBasePackageConfig } from './base-package.js';

export const npmPackageConfig = ( options = {} ) =>
	createBasePackageConfig( {
		outDir: 'dist',
		formats: [ 'es', 'cjs' ],
		manifest: false,
		...options,
	} );
