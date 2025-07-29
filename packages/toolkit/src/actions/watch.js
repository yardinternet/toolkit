/**
 * Internal dependencies
 */
import { watchBlocks } from '../scripts/watch-blocks.js';
import { watchThemes } from '../scripts/watch-themes.js';

export const watch = async ( options, mode ) => {
	switch ( mode ) {
		case 'themes':
			watchThemes();
			break;
		case 'blocks':
			watchBlocks();
			break;
	}
};
