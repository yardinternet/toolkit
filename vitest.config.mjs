import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		projects: [
			'packages/eslint-config/vitest.config.mjs',
			'packages/prettier-config/vitest.config.mjs',
		],
	},
} );
