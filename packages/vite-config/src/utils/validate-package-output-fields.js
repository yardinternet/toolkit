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
	const expectedImportFor = ( name ) => `${ normalizedOutDir }/${ name }.js`;

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
		const exportValue = exportsMap[ exportKey ];

		if ( typeof exportValue === 'undefined' ) {
			warnMismatch( {
				fieldName: `exports["${ exportKey }"]`,
				actual: '(missing)',
				expected: expectedImport,
				packageName,
			} );
			continue;
		}

		validateExportValue( {
			exportKey,
			exportValue,
			expectedImport,
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
