const normalizePath = ( value ) => {
	if ( typeof value !== 'string' ) {
		return null;
	}

	return value.replace( /^\.\//, '' ).replaceAll( '\\', '/' );
};

const warnMismatch = ( { fieldName, actual, expected, packageName } ) => {
	process.emitWarning(
		`[vite-config] ${ packageName } package.json "${ fieldName }" is "${
			actual || '(missing)'
		}", expected "${ expected }".`
	);
};

export const validatePackageOutputFields = ( {
	entryName,
	formats,
	outDir,
	packageJson,
} ) => {
	if ( ! packageJson || ! entryName || ! Array.isArray( formats ) ) {
		return;
	}

	const packageName = packageJson.name || 'current-package';
	const normalizedOutDir = outDir.replaceAll( '\\', '/' );
	const expected = {
		main: formats.includes( 'cjs' )
			? `${ normalizedOutDir }/${ entryName }.cjs.js`
			: null,
		module: formats.includes( 'es' )
			? `${ normalizedOutDir }/${ entryName }.es.js`
			: null,
	};

	const actualMain = normalizePath( packageJson.main );
	const actualModule = normalizePath( packageJson.module );

	if ( expected.main && actualMain && actualMain !== expected.main ) {
		warnMismatch( {
			fieldName: 'main',
			actual: packageJson.main,
			expected: expected.main,
			packageName,
		} );
	}

	if ( expected.module && actualModule && actualModule !== expected.module ) {
		warnMismatch( {
			fieldName: 'module',
			actual: packageJson.module,
			expected: expected.module,
			packageName,
		} );
	}

	const dotExport =
		typeof packageJson.exports === 'object' && packageJson.exports
			? packageJson.exports[ '.' ] || packageJson.exports
			: null;

	if ( ! dotExport ) {
		return;
	}

	const expectedImport = expected.module;
	const expectedRequire = expected.main;

	if ( typeof dotExport === 'string' ) {
		const actualExport = normalizePath( dotExport );
		if ( expectedImport && actualExport !== expectedImport ) {
			warnMismatch( {
				fieldName: 'exports',
				actual: dotExport,
				expected: expectedImport,
				packageName,
			} );
		}
		return;
	}

	if ( expectedImport && dotExport.import ) {
		const actualExportImport = normalizePath( dotExport.import );
		if ( actualExportImport !== expectedImport ) {
			warnMismatch( {
				fieldName: 'exports.import',
				actual: dotExport.import,
				expected: expectedImport,
				packageName,
			} );
		}
	}

	if ( expectedRequire && dotExport.require ) {
		const actualExportRequire = normalizePath( dotExport.require );
		if ( actualExportRequire !== expectedRequire ) {
			warnMismatch( {
				fieldName: 'exports.require',
				actual: dotExport.require,
				expected: expectedRequire,
				packageName,
			} );
		}
	}
};
