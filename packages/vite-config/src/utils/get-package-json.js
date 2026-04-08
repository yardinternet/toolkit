import fs from 'fs';
import path from 'path';

export const getPackageJson = ( cwd = process.cwd() ) => {
	const packageJsonPath = path.resolve( cwd, 'package.json' );

	if ( ! fs.existsSync( packageJsonPath ) ) {
		return { packageJson: null, packageJsonPath };
	}

	try {
		const packageJson = JSON.parse(
			fs.readFileSync( packageJsonPath, 'utf8' )
		);

		return { packageJson, packageJsonPath };
	} catch {
		return { packageJson: null, packageJsonPath };
	}
};
