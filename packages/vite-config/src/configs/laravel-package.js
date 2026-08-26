import { defineConfig } from 'vite';
import { createBasePackageConfig } from './base-package.js';
import { entryMapPlugin } from '../utils/entry-map-plugin.js';
import { requireEntry, toLibName } from '../utils/package-helpers.js';

export const laravelPackageConfig = ( {
	entryPoints = {},
	...options
} = {} ) => {
	/*
	 * Everything is built inside the async callback so nothing — the ENTRY guard
	 * included — runs until Vite asks for the config. build-package.js imports
	 * this module with ENTRY deliberately unset to read `entryPoints` below.
	 */
	const config = defineConfig( async () => {
		const entry = requireEntry( entryPoints );

		return createBasePackageConfig( {
			outDir: 'public',
			minify: true,
			publicDir: false,
			dts: false,
			...options,
			/*
			 * Below the spread on purpose: a package must not be able to opt out
			 * of the single-entry IIFE contract, which is what keeps the output a
			 * plain classic script with no import statements.
			 */
			formats: [ 'iife' ],
			fileName: ( _format, name ) => `${ name }.js`,
			entryPoints: { [ entry ]: entryPoints[ entry ] },
			plugins: [
				entryMapPlugin( { entry } ),
				...( options.plugins ?? [] ),
			],
			build: {
				...options.build,
				// The orchestrator clears public/ once up front; a per-build wipe
				// would delete the sibling entries' output.
				emptyOutDir: false,
				lib: {
					name: toLibName( entry ),
					cssFileName: entry,
				},
			},
		} )();
	} );

	config.entryPoints = Object.keys( entryPoints );

	return config;
};
