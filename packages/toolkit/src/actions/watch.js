/**
 * Internal dependencies
 */
import { watchBlocks } from '../scripts/watch-blocks.js';
import { watchThemes } from '../scripts/watch-themes.js';

export const watch = async ( options, mode ) => {
	if ( mode === 'themes' ) {
		watchThemes();
	}

	if ( mode === 'blocks' ) {
		watchBlocks();
	}
};
