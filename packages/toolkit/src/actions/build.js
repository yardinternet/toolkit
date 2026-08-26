/**
 * Internal dependencies
 */
import { buildThemes } from '../scripts/build-themes.js';
import { buildBlocks } from '../scripts/build-blocks.js';
import { buildPackage } from '../scripts/build-package.js';

export const build = ( options, mode, configFile = undefined ) => {
	switch ( mode ) {
		case 'themes':
			buildThemes( configFile );
			break;
		case 'blocks':
			buildBlocks( configFile );
			break;
		case 'package':
			buildPackage( configFile );
			break;
	}
};
