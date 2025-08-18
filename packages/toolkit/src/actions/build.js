/**
 * Internal dependencies
 */
import { buildThemes } from '../scripts/build-themes.js';
import { buildBlocks } from '../scripts/build-blocks.js';

export const build = ( options, mode, configFile = undefined ) => {
	switch ( mode ) {
		case 'themes':
			buildThemes( configFile );
			break;
		case 'blocks':
			buildBlocks( configFile );
			break;
	}
};
