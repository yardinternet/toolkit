/**
 * ESM facade over the CommonJS resolver, so the CJS configs (eslint, prettier,
 * postcss) and the ESM packages (toolkit, vite-config) share one
 * implementation without a build step.
 *
 * Properties are read off the default export rather than re-exported by name,
 * so resolution never depends on CJS named-export detection.
 */
import themeContext from './resolve-theme-context.cjs';

export const resolveThemeContext = themeContext.resolveThemeContext;
export const tryResolveThemeContext = themeContext.tryResolveThemeContext;
export const getAllThemeNames = themeContext.getAllThemeNames;
export const getParentThemes = themeContext.getParentThemes;
export const getThemesBaseUrl = themeContext.getThemesBaseUrl;
export const clearThemeContextCache = themeContext.clearThemeContextCache;
