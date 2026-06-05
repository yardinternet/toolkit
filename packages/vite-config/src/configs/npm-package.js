import { createBasePackageConfig } from './base-package.js';

export const npmPackageConfig = ( options = {} ) =>
	createBasePackageConfig( {
		outDir: 'dist',
		packageJsonValidation: true,
		classicJsx: true,
		...options,
	} );
