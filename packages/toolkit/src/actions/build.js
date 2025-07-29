/**
 * Internal dependencies
 */
import { buildThemes } from '../scripts/build-themes.js';
import { buildBlocks } from '../scripts/build-blocks.js';

export const build = ( options, mode ) => {
	switch ( mode ) {
		case 'themes':
			buildThemes();
			break;
		case 'blocks':
			buildBlocks();
			break;
	}
};
