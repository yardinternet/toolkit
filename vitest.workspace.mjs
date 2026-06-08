import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/eslint-config/vitest.config.mjs',
  'packages/prettier-config/vitest.config.mjs',
]);
