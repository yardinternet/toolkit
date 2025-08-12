#!/usr/bin/env node
import meow from 'meow';
import log from './utils/logger.js';
import { help } from './config/help.js';
import { actions } from './config/actions.js';
import { options } from './config/options.js';

let cli;

try {
	cli = meow( help, {
		importMeta: import.meta,
		flags: options,
		autoHelp: true,
		helpIndent: 0,
	} );
} catch ( errorMsg ) {
	log.error( errorMsg.toString().replace( 'Error: ', '' ) );
}

const actionName = cli.input[ 0 ];

if ( undefined === actionName ) {
	log.error( 'Please specify an action', false );
	cli.showHelp( 5 );
}

const filetype = cli.input[ 1 ];
const path = cli.input[ 2 ];

// get action function
const currentAction = actions[ actionName ];

if ( undefined === currentAction ) {
	log.error( `Action "${ actionName }" not defined.`, false );
	cli.showHelp( 5 );
}

currentAction.func( cli.flags, filetype, path );
