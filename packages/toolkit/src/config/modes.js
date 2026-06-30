import { filetypes } from './filetypes.js';
import { resolveThemeContext } from '../utils/resolve-theme-context.js';

/**
 * Builds the lint/format globs for the `brave` mode.
 *
 * - brave-root: matches `resources/**` across every theme.
 * - theme-root: matches the current theme's own `resources/**`.
 *
 * Computed lazily (via the getter below) so the project context is only
 * resolved when brave-mode globs are actually requested.
 */
const buildBravePaths = () => {
	const { mode } = resolveThemeContext();
	const prefix = mode === 'theme-root' ? '.' : './web/app/themes/**';

	return [
		{
			filetype: filetypes.js.name,
			path: [
				`${ prefix }/resources/scripts/**/*.js`,
				`${ prefix }/resources/scripts/**/*.jsx`,
			],
		},
		{
			filetype: filetypes.blade.name,
			path: `${ prefix }/resources/views/**/*.blade.php`,
		},
		{
			filetype: filetypes.css.name,
			path: `${ prefix }/resources/styles/{*,**/*}.css`,
		},
	];
};

export const modes = {
	brave: {
		name: 'brave',
		get paths() {
			return buildBravePaths();
		},
	},
	custom: {
		name: 'custom',
	},
};
