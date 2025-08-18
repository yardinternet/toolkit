/**
 * Internal dependencies
 */
import { watchBlocks } from '../scripts/watch-blocks.js';
import { watchThemes } from '../scripts/watch-themes.js';

export const watch = async ( options, mode, configFile = undefined ) => {
	switch ( mode ) {
		case 'themes':
			watchThemes( configFile );
			break;
		case 'blocks':
			watchBlocks( configFile );
			break;
	}
};
