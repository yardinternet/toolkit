import chalk from 'chalk';
import {exit} from 'node:process';
import {exec} from "node:child_process";

export const error = (
	msg = 'An error occurred',
	die = true,
	exitCode = 1
) => {
	// eslint-disable-next-line no-console
	console.error(`[${chalk.red('error')}] ${msg}`);

	if (die) {
		exit(exitCode);
	}
};

export const info = (msg) => {
	// eslint-disable-next-line no-console
	console.info(`[${chalk.blue('info')}] ${msg}`);
};

export const run = (command) => {
	exec(command, (isError, stdout, stderr) => {
		if (isError) {
			error(stderr)
		}
		// eslint-disable-next-line no-console
		console.log(stdout);
	});

}
