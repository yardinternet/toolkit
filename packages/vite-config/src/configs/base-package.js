import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

import { getPackageExternals } from '../utils/get-package-externals.js';
import { getPackageJson } from '../utils/get-package-json.js';
import { validatePackageOutputFields } from '../utils/validate-package-output-fields.js';

// TODO: just inline this. Wait a minute, format.js? css.js? Let's check this.
const defaultFileName = ( format, entryName ) =>
	`${ entryName }.${ format }.js`;

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
		'[createBasePackageConfig] entryPoints must be a string, array, or object map.'
	);
};

// TODO simplify to one function, move to helper file
const toAbsoluteEntries = ( entryPoints, cwd ) =>
	Object.fromEntries(
		Object.entries( entryPoints ).map( ( [ entryName, entryPath ] ) => [
			entryName,
			path.resolve( cwd, entryPath ),
		] )
	);

// TODO: move to TypeScript utils
const TS_FILE_EXTENSIONS = [ '.ts', '.tsx', '.mts', '.cts' ];

const hasTypeScriptEntry = ( entryPoints ) =>
	Object.values( entryPoints ).some( ( entryPath ) =>
		TS_FILE_EXTENSIONS.includes( path.extname( entryPath ) )
	);

const canUseDeclarationPlugin = async () => {
	try {
		// eslint-disable-next-line import/no-unresolved
		await import( 'vite-plugin-dts' );
		return true;
	} catch {
		return false;
	}
};

// Todo: simplify this because vite-plugin-dts is always a dependency of this package.
const createDeclarationPlugin = async ( { enabled, entryRoot, outDir } ) => {
	if ( ! enabled ) {
		return [];
	}

	if ( ! ( await canUseDeclarationPlugin() ) ) {
		process.emitWarning(
			'[vite-config] d.ts generation is enabled but vite-plugin-dts is not installed. Skipping declaration output.'
		);
		return [];
	}

	// eslint-disable-next-line import/no-unresolved
	const dtsModule = await import( 'vite-plugin-dts' );
	const dtsPlugin = dtsModule.default;

	return [
		dtsPlugin( {
			entryRoot,
			outDir,
			skipDiagnostics: false,
		} ),
	];
};

const normalizeFormats = ( formats = [ 'es', 'cjs' ] ) =>
	Array.isArray( formats ) && formats.length > 0 ? formats : [ 'es', 'cjs' ];

// Todo: simplify, one line function.
const hasWatchFlag = () =>
	process.env.WATCH === 'true' || process.argv.includes( '--watch' );

const defaultAssetFileNames = ( assetInfo ) => {
	const extension = path.extname( assetInfo.name || '' ).slice( 1 );

	if ( extension ) {
		return `assets/[name].[hash].${ extension }`;
	}

	return 'assets/[name].[hash][extname]';
};

export const createBasePackageConfig = ( {
	entryPoints,
	outDir = 'dist',
	externals = [],
	autoExternal = false, // TODO: Remove auto externals
	wpExternals = false,
	formats = [ 'es', 'cjs' ],
	fileName = defaultFileName,
	sourcemap,
	dts, // TODO: remove this because it auto detects
	packageJsonValidation = true,
	test = {},
	manifest = false, // TODO: do I really need this? check in Laravel package
	watch, // TODO: remove, since it auto detects?
	name, // TODO: remove maybe
} = {} ) => {
	const normalizedEntries = toEntryObject( entryPoints );
	const cwd = process.cwd();
	const absoluteEntries = toAbsoluteEntries( normalizedEntries, cwd );
	const hasMissingEntry = Object.values( absoluteEntries ).some(
		( entryPath ) => ! fs.existsSync( entryPath )
	);

	if ( hasMissingEntry ) {
		throw new Error(
			'[createBasePackageConfig] One or more entry points do not exist.'
		);
	}

	const shouldGenerateTypes =
		typeof dts === 'boolean' ? dts : hasTypeScriptEntry( absoluteEntries );
	const resolvedFormats = normalizeFormats( formats );
	const primaryEntryName = Object.keys( normalizedEntries )[ 0 ];
	const isWatchMode = typeof watch === 'boolean' ? watch : hasWatchFlag();
	let resolvedSourcemap = sourcemap;

	if ( typeof resolvedSourcemap === 'undefined' ) {
		resolvedSourcemap = isWatchMode ? 'inline' : false;
	}

	return defineConfig( async () => {
		const { packageJson } = getPackageJson( cwd );
		// Todo: simplify externals,
		// Todo: use the wordPress plugin to convert WordPress dependencies to window globals
		// Todo: React and ReactDOM and @wordpress/element should be externalized by default (see BraveConfig)
		const { isExternal } = getPackageExternals( {
			externals,
			autoExternal,
			wpExternals,
			packageJson,
		} );

		// Todo: simplify this because vite-plugin-dts is always a dependency of this package.
		const declarationPlugins = await createDeclarationPlugin( {
			enabled: shouldGenerateTypes,
			entryRoot: 'src',
			outDir,
		} );

		// Todo: check if packageJsonValidation is only npm based
		if ( packageJsonValidation ) {
			validatePackageOutputFields( {
				entryName: primaryEntryName,
				formats: resolvedFormats,
				outDir,
				packageJson,
			} );
		}

		return {
			plugins: [ ...declarationPlugins ],
			test: {
				environment: 'jsdom',
				...test,
			},
			build: {
				outDir,
				lib: {
					entry: absoluteEntries,
					formats: resolvedFormats,
					name,
					fileName,
				},
				assetsInlineLimit: 0,
				manifest,
				target: 'esnext',
				sourcemap: resolvedSourcemap,
				minify: ! isWatchMode,
				emptyOutDir: ! isWatchMode,
				watch: isWatchMode
					? {
							include: 'src/**', // TODO: this should be entryoints?
					  }
					: undefined,
				rollupOptions: {
					external: ( id ) => isExternal( id ),
					treeshake: true,
					output: {
						chunkFileNames: ( chunkInfo ) =>
							`chunks/${ chunkInfo.name }.[hash].js`,
						assetFileNames: defaultAssetFileNames,
					},
				},
			},
		};
	} );
};
