import { watch } from '../actions/watch.js';
import { build } from '../actions/build.js';
import { format } from '../actions/format.js';
import { lint } from '../actions/lint.js';

export const actions = {
	watch: {
		name: 'watch',
		func: watch,
	},
	build: {
		name: 'build',
		func: build,
	},
	format: {
		name: 'format',
		func: format,
	},
	lint: {
		name: 'lint',
		func: lint,
	},
};
