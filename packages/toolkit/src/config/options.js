import { modes } from './modes.js';

export const options = {
	mode: {
		name: 'mode',
		type: 'string',
		shortFlag: 'm',
		choices: [ modes.brave.name, modes.custom.name ],
		default: modes.brave.name,
	},
};
