import { laravelPackageConfig } from '../../../src/configs/laravel-package.js';

export default laravelPackageConfig( {
	entryPoints: {
		banner: 'resources/src/entries/banner.ts',
		editor: 'resources/src/entries/editor.tsx',
	},
} );
