import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import { spawn } from 'child_process';
import { runCommand } from '../src/utils/helpers.js';

vi.mock( 'child_process', () => ( {
	exec: vi.fn(),
	spawn: vi.fn(),
} ) );

vi.mock( '../src/utils/logger.js', () => ( {
	default: {
		info: vi.fn(),
		success: vi.fn(),
		error: vi.fn(),
	},
} ) );

describe( 'runCommand', () => {
	let exitHandler;

	beforeEach( () => {
		spawn.mockReturnValue( {
			on: vi.fn( ( event, handler ) => {
				if ( event === 'exit' ) exitHandler = handler;
			} ),
		} );
	} );

	afterEach( () => {
		process.exitCode = undefined;
		vi.clearAllMocks();
	} );

	test.each( [
		[ 0, 0 ],
		[ 1, 1 ],
		[ null, 1 ],
	] )( 'sets process.exitCode to %s when the child exits', ( code, expected ) => {
		runCommand( 'eslint', [], [] );
		exitHandler( code );

		expect( process.exitCode ).toBe( expected );
	} );
} );
