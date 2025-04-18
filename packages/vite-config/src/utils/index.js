import { resolve } from 'path';

export const isWatchMode = () => process.env.WATCH === 'true';

export const resolveEntry = ( entry ) => resolve( process.cwd(), entry );
