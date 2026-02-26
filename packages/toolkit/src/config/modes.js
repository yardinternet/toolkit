import { filetypes } from './filetypes.js';

export const modes = {
	brave: {
		name: 'brave',
		paths: [
			{
				filetype: filetypes.js.name,
				path: [
					'./web/app/themes/**/resources/scripts/**/*.js',
					'./web/app/themes/**/resources/scripts/**/*.jsx',
				],
			},
			{
				filetype: filetypes.blade.name,
				path: './web/app/themes/**/resources/views/**/*.blade.php',
			},
			{
				filetype: filetypes.css.name,
				path: './web/app/themes/**/resources/styles/{*,**/*}.css',
			},
		],
	},
	custom: {
		name: 'custom',
	},
};
