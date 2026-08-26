import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		projects: [
			'packages/eslint-config/vitest.config.mjs',
			'packages/prettier-config/vitest.config.mjs',
			'packages/vite-config/vitest.config.mjs',
			'packages/wp-scripts-config/vitest.config.mjs',
		],
	},
} );
