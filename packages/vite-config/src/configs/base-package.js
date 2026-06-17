/**
 * External dependencies
 */
import { defineConfig } from 'vite';
import { viteExternalsPlugin } from 'vite-plugin-externals';
import { wordpressPlugin } from '@roots/vite-plugin';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import fs from 'fs';

/**
 * Internal dependencies
 */
import {
	getPackageJson,
	validatePackageOutputFields,
} from '../utils/package-json.js';
import {
	toEntryObject,
	toAbsoluteEntries,
	defaultFileName,
	createAssetFileNames,
} from '../utils/package-helpers.js';

export const createBasePackageConfig = ( {
	entryPoints,
	outDir = 'dist',
	externals = [],
	formats = [ 'es' ],
	fileName = defaultFileName,
	packageJsonValidation = false,
	test = {},
	manifest = false,
	plugins = [],
	externalizeReact = true,
	wordpressGlobals = true,
	classicJsx = false,
} = {} ) => {
	const cwd = process.cwd();
	const normalizedEntries = toEntryObject( entryPoints );
	const absoluteEntries = toAbsoluteEntries( normalizedEntries, cwd );
	const hasMissingEntry = Object.values( absoluteEntries ).some(
		( entryPath ) => ! fs.existsSync( entryPath )
	);

	if ( hasMissingEntry ) {
		throw new Error(
			'[vite-config] One or more entry points do not exist.'
		);
	}

	const resolvedFormats =
		Array.isArray( formats ) && formats.length > 0 ? formats : [ 'es' ];
	const primaryEntryName = Object.keys( normalizedEntries )[ 0 ];
	const hasTsEntries = Object.values( absoluteEntries ).some( ( entry ) =>
		/\.tsx?$/.test( entry )
	);
	const isWatchMode =
		process.env.WATCH === 'true' || process.argv.includes( '--watch' );

	return defineConfig( async () => {
		const { packageJson } = getPackageJson( cwd );

		if ( packageJsonValidation ) {
			validatePackageOutputFields( {
				entryName: primaryEntryName,
				entryNames: Object.keys( normalizedEntries ),
				formats: resolvedFormats,
				outDir,
				packageJson,
			} );
		}

		return {
			plugins: [
				/**
				 * Externalizes React, ReactDOM and ReactJSXRuntime & reference global versions
				 * provided by WordPress' wp-element (window.React, window.ReactDOM)
				 */
				externalizeReact &&
					viteExternalsPlugin( {
						react: 'React',
						'react-dom': 'ReactDOM',
						'react/jsx-runtime': 'ReactJSXRuntime',
					} ),
				/**
				 * Transforms @wordpress/ dependencies to reference window.wp global
				 */
				wordpressGlobals && wordpressPlugin(),
			]
				.filter( Boolean )
				.concat( [
					hasTsEntries && dts(),
					hasTsEntries &&
						isWatchMode &&
						checker( { typescript: true } ),
					...plugins,
				] ),
			/**
			 * Use classic JSX transform (React.createElement) so no react/jsx-runtime import is
			 * generated. Consuming webpack (@wordpress/scripts) only needs window.React.
			 */
			esbuild: classicJsx
				? {
						jsx: 'transform',
						jsxFactory: 'React.createElement',
						jsxFragment: 'React.Fragment',
				  }
				: {},
			test: {
				environment: 'jsdom',
				...test,
			},
			build: {
				outDir,
				lib: {
					entry: absoluteEntries,
					formats: resolvedFormats,
					fileName,
				},
				assetsInlineLimit: 0,
				manifest,
				target: 'esnext',
				sourcemap: isWatchMode ? 'inline' : false,
				minify: ! isWatchMode,
				emptyOutDir: ! isWatchMode,
				rollupOptions: {
					external: externals,
					treeshake: true,
					output: {
						chunkFileNames: ( chunkInfo ) =>
							`chunks/${ chunkInfo.name }.[hash].js`,
						assetFileNames: createAssetFileNames( {
							withHash: Boolean( manifest ),
						} ),
					},
				},
			},
		};
	} );
};
