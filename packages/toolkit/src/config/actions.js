import { format } from '../actions/format.js';
import { lint } from '../actions/lint.js';

export const actions = {
	format: {
		name: 'format',
		func: format,
	},
	lint: {
		name: 'lint',
		func: lint,
	},
};
