import { defineConfig, mergeConfig } from 'vite';
import { resolveEntry, isWatchMode } from '../utils';
import { baseConfig } from '../base';

export const vanillaLibraryConfig = ( options = {} ) =>
	defineConfig(
		mergeConfig( baseConfig, {
			build: {
				lib: {
					entry: resolveEntry( options.entry ?? 'src/index.ts' ),
					name: options.name ?? 'MyVanillaLibrary',
				},
				watch: isWatchMode() ? { include: 'src/**' } : null,
			},
		} )
	);
