/**
 * Internal dependencies
 */
import { buildThemes } from '../scripts/build-themes.js';
import { buildBlocks } from '../scripts/build-blocks.js';

export const build = ( options, mode ) => {
	if ( mode === 'themes' ) {
		buildThemes();
	}

	if ( mode === 'blocks' ) {
		buildBlocks();
	}
};
