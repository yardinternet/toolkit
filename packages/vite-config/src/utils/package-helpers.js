import path from 'path';

export const toEntryObject = ( entryPoints ) => {
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

export const toAbsoluteEntries = ( entryPoints, cwd ) =>
	Object.fromEntries(
		Object.entries( entryPoints ).map( ( [ entryName, entryPath ] ) => [
			entryName,
			path.resolve( cwd, entryPath ),
		] )
	);

export const defaultFileName = ( format, entryName ) =>
	format === 'es' ? `${ entryName }.js` : `${ entryName }.${ format }.js`;

export const createAssetFileNames =
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
