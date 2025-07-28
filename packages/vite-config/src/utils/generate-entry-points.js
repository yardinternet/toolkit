/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

const DEFAULT_ENTRIES = [
	'scripts/frontend/frontend.js',
	'scripts/editor/editor.js',
	'styles/frontend.css',
	'styles/editor.css',
];

export const generateEntryPoints = ( {
	themeNames,
	baseDir,
	projectConfig = {},
} ) => {
	const entryPoints = [];

	if ( ! themeNames || themeNames.length === 0 ) {
		throw new Error(
			'No theme names provided for entry point generation.'
		);
	}

	themeNames.forEach( ( themeName ) => {
		const themeDir = path.join(
			baseDir,
			'web/app/themes',
			themeName,
			'resources'
		);

		const projectOverrides =
			( projectConfig.themes && projectConfig.themes[ themeName ] ) || {};

		// Combine default entrypoints and any additional ones defined in the projectConfig
		const entries = [
			...DEFAULT_ENTRIES,
			...( projectOverrides.add || [] ),
		];

		// Push valid file paths to the input list
		entries.forEach( ( entry ) => {
			const entryPoint = path.join( themeDir, entry );
			if ( fs.existsSync( entryPoint ) ) {
				entryPoints.push( entryPoint );
			}
		} );
	} );

	return entryPoints;
};
