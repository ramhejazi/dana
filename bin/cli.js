#!/usr/bin/env node

const Liftoff = require('liftoff');
const commander = require('commander');
const path = require('path');
const chalk = require('chalk');
const bluebird = require('bluebird');
const tildify = require('tildify');
const argv = require('minimist')(process.argv.slice(2));
// const cliff = require('cliff');
const pkg = require('../package');
const helpers = require('../src/lib/helpers');
const log = require('../src/lib/log');
const _ = require('lodash');
const { DanaError } = require('../src/errors');
const fs = require('fs-extra');
const ValidationError = require('mitra').ValidationError;

const util = {
	env: null,
	Promise: bluebird,
	argv,
	// cliff,
	tildify,
	path,
	chalk,
	log,
	fs,

	echoMitraValidationError(error) {
		log.fail('Validation Error:');
		if ( error.file ) {
			log.fail(`file: ${error.file.path}`);
		}
		_.each(error.errors, (message, key) => {
			log.fail(`${chalk.bold(key)}: ${message}`);
		});
	},

	exit(e) {
		if ( e instanceof DanaError ) {
			log.fail(`${e.name}: ${e.message || e}`);
			if (e.file)
				log.fail(`file: ${e.file.path}`);
		} else if (e instanceof ValidationError ) {
			this.echoMitraValidationError(e);
		} else {
			console.log(e);
		}
		process.exit(1);
	},

	ensureLocalModule() {
		if (!this.env.modulePath) {
			this.log.fail('No local dana install found in: ' + chalk.magenta(tildify(this.env.cwd)));
			this.exit('Try installing dana by using the following command: "npm install dana".');
		}
	},

	logMessages(messages = []) {
		if ( Array.isArray(messages) ) {
			return messages.forEach(m => {
				let {type = 'info', message} = m;
				log[type](message);
			});
		} else {
			console.log(messages);
		}
	},

	getDanaIns() {
		const env = this.env;
		this.ensureLocalModule();
		if (!env.configPath) {
			this.exit('No danafile found in this directory. Specify a path with --danafile');
		}
		if (process.cwd() !== env.cwd) {
			process.chdir(env.cwd);
			log.info('Working directory changed to ' + chalk.magenta(tildify(env.cwd)));
		}
		var environment = commander.env || process.env.NODE_ENV;
		var defaultEnv = 'development';
		var config = require(env.configPath);

		if (!environment && typeof config[defaultEnv] === 'object') {
			environment = defaultEnv;
		}

		if (environment) {
			log.info('Using environment: ' + environment);
			config = config[environment];
		}

		if (!config) {
			log.fail('Unable to read danafile config!');
			process.exit(1);
		}

		if (argv.debug !== undefined) config.debug = argv.debug;
		var dana = require(env.modulePath);
		config.modulePath = env.modulePath;
		config.baseDir = env.cwd;
		return dana(config, environment);
	}
};

function actionWrapper(handler) {
	return function() {
		handler.call(this, argv, util, ...arguments);
	};
}

function invoke(env) {
	util.env = env;
	commander
		.version(
			chalk.blue('dana CLI version: ', chalk.green(pkg.version)) + '\n' +
			chalk.blue('Local dana version: ', chalk.green(env.modulePackage.version)) + '\n'
		)
		.option('--danafile [path]', 'Specify the danafile path.')
		.option('--cwd [path]', 'Specify the working directory.')
		.option('--env [name]', 'environment, default: process.env.NODE_ENV || development');

	helpers.readDir(path.join(__dirname, './commands') + '/*.js').then(commandFiles => {
		const cmdNames = _.map(commandFiles, 'name').concat(_.map(commandFiles, 'src.alias'));
		// Define commands programmatically!
		commandFiles.forEach(file => {
			let spec = file.src;
			let command = commander.command(spec.cmd);
			command.description(spec.description);
			if (spec.options) {
				spec.options.forEach(option => {
					command.option(...option);
				});
			}
			if (spec.alias) {
				command.alias(spec.alias);
			}
			command.action(actionWrapper(spec.handler));
		});
		commander.parse(process.argv);
		const cmdName = process.argv[2];

		if (process.argv.length < 3 || !cmdNames.includes(cmdName)) {
			if (cmdName) log.fail(`Unknown command "${cmdName}"!`);
			commander.help();
		}
	});
}

var liftoff = new Liftoff({
	name: 'dana',
	extensions: {
		'.js': null
	},
	v8flags: require('v8flags')
});

liftoff.on('require', function(name) {
	console.log('Requiring external module', chalk.magenta(name));
});

liftoff.on('requireFail', function(name) {
	console.log(chalk.red('Failed to load external module'), chalk.magenta(name));
});

liftoff.launch({
	cwd: argv.cwd,
	configPath: argv.danafile,
	require: argv.require,
	completion: argv.completion
}, invoke);
