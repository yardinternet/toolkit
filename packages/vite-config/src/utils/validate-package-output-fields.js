export const validatePackageOutputFields = ( {
	entryName,
	entryNames,
	formats,
	outDir,
	packageJson,
} ) => {
	if ( ! packageJson || ! entryName || ! Array.isArray( formats ) ) {
		return;
	}

	const packageName = packageJson.name || 'current-package';
	const normalizedOutDir = outDir.replaceAll( '\\', '/' );
	const resolvedEntryNames =
		Array.isArray( entryNames ) && entryNames.length > 0
			? entryNames
			: [ entryName ];
	const expectedImportFor = ( name ) =>
		formats.includes( 'es' ) ? `${ normalizedOutDir }/${ name }.js` : null;
	const expectedRequireFor = ( name ) =>
		formats.includes( 'cjs' )
			? `${ normalizedOutDir }/${ name }.cjs.js`
			: null;

	const exportsMap = toExportsMap( packageJson.exports );

	if ( ! exportsMap ) {
		warnMismatch( {
			fieldName: 'exports',
			actual: packageJson.exports,
			expected: '{ ".": { "import": "<outDir>/<entry>.js" } }',
			packageName,
		} );
		return;
	}

	for ( const currentEntryName of resolvedEntryNames ) {
		const exportKey =
			currentEntryName === entryName ? '.' : `./${ currentEntryName }`;
		const expectedImport = expectedImportFor( currentEntryName );
		const expectedRequire = expectedRequireFor( currentEntryName );
		const exportValue = exportsMap[ exportKey ];

		if ( typeof exportValue === 'undefined' ) {
			warnMismatch( {
				fieldName: `exports["${ exportKey }"]`,
				actual: '(missing)',
				expected: expectedRequire
					? `{ "import": "${ expectedImport }", "require": "${ expectedRequire }" }`
					: expectedImport,
				packageName,
			} );
			continue;
		}

		validateExportValue( {
			exportKey,
			exportValue,
			expectedImport,
			expectedRequire,
			packageName,
		} );
	}
};

const toExportsMap = ( exportsField ) => {
	if ( ! exportsField ) {
		return null;
	}

	if ( typeof exportsField === 'string' ) {
		return { '.': exportsField };
	}

	if ( typeof exportsField !== 'object' ) {
		return null;
	}

	const exportKeys = Object.keys( exportsField );
	const hasSubpathKeys = exportKeys.some(
		( key ) => key === '.' || key.startsWith( './' )
	);

	if ( hasSubpathKeys ) {
		return exportsField;
	}

	return { '.': exportsField };
};

const validateExportValue = ( {
	exportKey,
	exportValue,
	expectedImport,
	expectedRequire,
	packageName,
} ) => {
	if ( typeof exportValue === 'string' ) {
		const actualExport = normalizePath( exportValue );
		if ( expectedImport && actualExport !== expectedImport ) {
			warnMismatch( {
				fieldName: `exports["${ exportKey }"]`,
				actual: exportValue,
				expected: expectedImport,
				packageName,
			} );
		}
		return;
	}

	if ( ! exportValue || typeof exportValue !== 'object' ) {
		warnMismatch( {
			fieldName: `exports["${ exportKey }"]`,
			actual: exportValue,
			expected: expectedImport,
			packageName,
		} );
		return;
	}

	if ( expectedImport ) {
		const actualExportImport =
			normalizePath( exportValue.import ) ||
			normalizePath( exportValue.default );

		if ( actualExportImport !== expectedImport ) {
			warnMismatch( {
				fieldName: `exports["${ exportKey }"].import`,
				actual: exportValue.import || exportValue.default,
				expected: expectedImport,
				packageName,
			} );
		}
	}

	if ( expectedRequire ) {
		const actualExportRequire = normalizePath( exportValue.require );
		if ( actualExportRequire !== expectedRequire ) {
			warnMismatch( {
				fieldName: `exports["${ exportKey }"].require`,
				actual: exportValue.require,
				expected: expectedRequire,
				packageName,
			} );
		}
	}
};

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
