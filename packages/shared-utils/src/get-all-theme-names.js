/**
 * Internal dependencies
 */
import { resolveThemeContext } from './resolve-theme-context.js';

/**
 * Returns an array of all theme names for the current project context.
 *
 * - brave-root: every theme in `web/app/themes` that has a `style.css`.
 * - theme-root: a single-element array with the current theme's name.
 */
export const getAllThemeNames = () => {
	return resolveThemeContext().themes.map( ( theme ) => theme.name );
};
