#!/usr/bin/env node
import meow from 'meow';
import {error} from './utils/helpers.js';
import { help } from './config/help.js';
import {actions} from "./config/actions.js";
import {options} from "./config/options.js";

let cli;

try {
	cli = meow( help, {
		importMeta: import.meta,
		flags: options,
		autoHelp: true,
		helpIndent: 0,
	} );
} catch ( errorMsg ) {
	error( errorMsg.toString().replace( 'Error: ', '' ) );
}

const actionName = cli.input[ 0 ];

if ( undefined === actionName ) {
	error( 'Please specify an action', false);
	cli.showHelp( 5 );
}

const filetype = cli.input[ 1 ];
const path = cli.input[ 2 ];

// get action function
const currentAction = actions[actionName];

if (undefined === currentAction) {
	error( `Action "${ actionName }" not defined.`, false );
	cli.showHelp( 5 );
}

currentAction.func(cli.flags, filetype, path);
