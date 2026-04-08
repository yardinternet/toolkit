const hasSubpath = ( id, pkgName ) =>
	id === pkgName || id.startsWith( `${ pkgName }/` );

export const WP_EXTERNALS = [ 'react', 'react-dom', '@wordpress/element' ];

export const getPackageExternals = ( {
	externals = [],
	autoExternal = false,
	wpExternals = false,
	packageJson,
} = {} ) => {
	const userExternals = Array.isArray( externals ) ? externals : [];
	const dependencyExternals = autoExternal
		? [
				...Object.keys( packageJson?.dependencies || {} ),
				...Object.keys( packageJson?.peerDependencies || {} ),
				...Object.keys( packageJson?.optionalDependencies || {} ),
		  ]
		: [];
	const wpExternalList = wpExternals ? WP_EXTERNALS : [];
	const combined = [
		...new Set( [
			...userExternals,
			...dependencyExternals,
			...wpExternalList,
		] ),
	];

	return {
		externalPackages: combined,
		isExternal: ( id ) =>
			combined.some( ( pkgName ) => hasSubpath( id, pkgName ) ),
	};
};
