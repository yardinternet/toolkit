/**
 * Internal dependencies
 */
import { watchBlocks } from '../scripts/watch-blocks.js';
import { watchThemes } from '../scripts/watch-themes.js';
import { watchPackage } from '../scripts/watch-package.js';

export const watch = async ( options, mode, configFile = undefined ) => {
	switch ( mode ) {
		case 'themes':
			watchThemes( configFile );
			break;
		case 'blocks':
			watchBlocks( configFile );
			break;
		case 'package':
			watchPackage( configFile );
			break;
	}
};
