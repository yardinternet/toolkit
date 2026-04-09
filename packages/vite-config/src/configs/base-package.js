/**
 * External dependencies
 */
import { defineConfig } from 'vite';
import { viteExternalsPlugin } from 'vite-plugin-externals';
import { wordpressPlugin } from '@roots/vite-plugin';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import path from 'path';

/**
 * Internal dependencies
 */
import {
	getPackageJson,
	validatePackageOutputFields,
} from '../utils/package-json.js';

const toEntryObject = ( entryPoints ) => {
	if ( typeof entryPoints === 'string' ) {
		return { index: entryPoints };
	}

	if ( Array.isArray( entryPoints ) ) {
		return entryPoints.reduce( ( entries, entryPath ) => {
			const entryName = path.parse( entryPath ).name;
			return { ...entries, [ entryName ]: entryPath };
		}, {} );
	}

	if ( entryPoints && typeof entryPoints === 'object' ) {
		return entryPoints;
	}

	throw new Error(
		'[vite-config] entryPoints must be a string, array, or object map.'
	);
};

const toAbsoluteEntries = ( entryPoints, cwd ) =>
	Object.fromEntries(
		Object.entries( entryPoints ).map( ( [ entryName, entryPath ] ) => [
			entryName,
			path.resolve( cwd, entryPath ),
		] )
	);

const defaultFileName = ( format, entryName ) =>
	format === 'es' ? `${ entryName }.js` : `${ entryName }.${ format }.js`;

const createAssetFileNames =
	( { withHash } ) =>
	( assetInfo ) => {
		const extension = path.extname( assetInfo.name || '' ).slice( 1 );
		const hashPart = withHash ? '.[hash]' : '';

		if ( extension === 'css' ) {
			return `[name]${ hashPart }.${ extension }`;
		}

		if ( extension ) {
			return `assets/[name]${ hashPart }.${ extension }`;
		}

		return `assets/[name]${ hashPart }[extname]`;
	};

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
				/**
				 * Generates TypeScript declaration files.
				 */
				dts(),
				...plugins,
			].filter( Boolean ),
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
							withHash: manifest,
						} ),
					},
				},
			},
		};
	} );
};
