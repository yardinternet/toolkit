/**
 * Internal dependencies
 */
import { resolveThemeContext } from '@yardinternet/shared-utils';
import log from '../utils/logger.js';

const SOURCE_LABELS = {
	config: 'yard-toolkit.config.json / package.json "yardToolkit"',
	env: 'YARD_THEMES_DIR environment variable',
	composer: 'composer.json extra.installer-paths',
	probe: 'known layout probe',
	'style.css': 'style.css in the current directory',
};

/**
 * Prints the resolved project layout. First stop when paths do not line up.
 */
export const info = () => {
	let context;

	try {
		context = resolveThemeContext();
	} catch ( err ) {
		log.error( err.message );
		return;
	}

	log.info( `Mode:           ${ context.mode }` );
	log.info( `Project root:   ${ context.projectRoot }` );
	log.info(
		`Themes dir:     ${ context.themesRelDirPosix } (${
			SOURCE_LABELS[ context.source ] ?? context.source
		})`
	);
	log.info( `Docroot:        ${ context.docRoot ?? 'not detected' }` );
	log.info( `Asset base URL: ${ context.themesBaseUrl }` );
	log.info( `Default theme:  ${ context.defaultTheme }` );

	context.themes.forEach( ( theme ) => {
		const relation = theme.isParent
			? 'parent'
			: `child of ${ theme.template }`;

		log.info( `  - ${ theme.name } (${ relation })` );
	} );
};
