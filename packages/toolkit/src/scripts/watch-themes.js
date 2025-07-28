import { spawn } from 'child_process';

export const watchThemes = () => {
	// Simply run 'vite' to watch themes
	const child = spawn( 'vite', [], {
		stdio: 'inherit',
		shell: true,
	} );
	child.on( 'error', ( err ) => {
		console.error( '❌ Failed to start vite:', err.message );
	} );
};
