import { defineConfig } from 'vite';

export const baseConfig = defineConfig( {
	test: {
		environment: 'jsdom',
	},
	optimizeDeps: {
		exclude: [
			'@yardinternet/gutenberg-components',
			'@yardinternet/gutenberg-hooks',
		],
	},
} );
