import { afterEach, describe, expect, it } from 'vitest';
import { requireEntry, toLibName } from '../src/utils/package-helpers.js';

const ENTRY_POINTS = { banner: 'resources/src/entries/banner.ts' };

afterEach( () => {
	delete process.env.ENTRY;
} );

describe( 'requireEntry', () => {
	it( 'returns the entry named by process.env.ENTRY', () => {
		process.env.ENTRY = 'banner';

		expect( requireEntry( ENTRY_POINTS ) ).toBe( 'banner' );
	} );

	it( 'throws and names the toolkit command when ENTRY is unset', () => {
		expect( () => requireEntry( ENTRY_POINTS ) ).toThrow(
			/yard-toolkit build package/
		);
	} );

	it( 'throws when ENTRY is not a declared entry point', () => {
		process.env.ENTRY = 'nope';

		expect( () => requireEntry( ENTRY_POINTS ) ).toThrow(
			/yard-toolkit build package/
		);
	} );
} );

describe( 'toLibName', () => {
	it( 'replaces characters that are invalid in a JS identifier', () => {
		expect( toLibName( 'address-field-with-map' ) ).toBe(
			'address_field_with_map'
		);
	} );

	it( 'leaves a valid identifier untouched', () => {
		expect( toLibName( 'banner' ) ).toBe( 'banner' );
	} );
} );
