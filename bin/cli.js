#!/usr/bin/env node

const Liftoff 				= require('liftoff')
	, ValidationError 	= require('mitra').ValidationError
	, DanaError 				= require('../src/errors').DanaError
	, _ 								= require('lodash')
	, fs 								= require('fs-extra')
	, commander					= require('commander')
	, path							= require('path')
	, chalk							= require('chalk')
	, bluebird					= require('bluebird')
	, tildify						= require('tildify')
	, argv							= require('minimist')(process.argv.slice(2))
	, pkg								= require('../package')
	, helpers						= require('../src/lib/helpers')
	, log 							= require('../src/lib/log');

/**
 * An utility object
 */
const util = {
	/**
	 	* env's value is set by using liftoff's environment
	 	*/
	env: null,
	Promise: bluebird,
	argv, tildify, path, chalk, log, fs,

	/**
 	* Log mitra's validation errors
 	* @param {object} mitraError instance of mitra ValidationError class
 	*/
	echoMitraValidationError(mitraError) {
		log.fail('Validation Error:');
		if ( mitraError.file ) {
			log.fail(`file: ${mitraError.file.path}`);
		}
		_.each(mitraError.errors, (message, key) => {
			log.fail(`${chalk.bold(key)}: ${message}`);
		});
	},

	/**
	 * Exit from current nodejs process
	 * @param {object|string} e an error object or an error message
	 */
	exit(e) {
		if ( e instanceof DanaError ) {
			log.fail(`${e.name}: ${e.message || e}`);
			if ( e.file ) {
				log.fail(`\nfile: ${e.file.path}`);
			}
		} else if ( e instanceof ValidationError ) {
			this.echoMitraValidationError(e);
		} else {
			console.log(e);
		}
		process.exit(1);
	},

	/**
	 * Ensure dana module has been installed locally in project directory
	 * CURRENTLY UNUSED and should be removed!
	 */
	ensureLocalModule() {
		if ( !this.env.modulePath ) {
			this.log.fail('No local dana install found in: ' + chalk.magenta(tildify(this.env.cwd)));
			this.exit('Try installing dana by using the following command: "npm install dana".');
		}
	},

	/**
	 * Log messsages
	 *
	 * @param {array} messages
	 * @param {string} messages[].type type of the message
	 * @param {string} messages[].message message content
	 */
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

	/**
 	* Create a dana instance for the set environment
	* @todo validate danafile contents!
 	* @return {object} a dana instance
 	*/
	getDanaIns() {
		const env = this.env;

		// REMOVING LOCAL DEPENDENCY! Reason: Why does it have to be unnecessarily complicated?
		// this.ensureLocalModule();

		if ( !env.configPath ) {
			this.exit('No danafile found in this directory. Specify a path with --danafile');
		}

		if ( process.cwd() !== env.cwd ) {
			process.chdir(env.cwd);
			log.info('Working directory changed to ' + chalk.magenta(tildify(env.cwd)));
		}

		const
			environment  = ( commander.env || process.env.NODE_ENV || 'development' )
			, danaFile = require(env.configPath);

		const config = danaFile[environment];

		if (!config) {
			log.fail('Unable to read danafile config!');
			process.exit(1);
		}

		if (argv.debug !== undefined) config.debug = argv.debug;
		// use the current globally installed dana!
		var dana = require('../src/dana');
		// config.modulePath = env.modulePath;
		config.baseDir = env.cwd;
		return dana(config, environment);
	}
};

function actionWrapper(handler) {
	return function() {
		handler.call(this, argv, util, ...arguments);
	};
}

/**
 * Callback of the `liftoff.launch` function.
 * @param {object} env
 * @param {string} env.cwd absolute path of working directory
 * @param {string} env.configPath absolute path of danafile.js
 * @param {string} env.modulePackage dana modules's package.json
 */
function invoke(env) {
	util.env = env;
	commander
		.version( pkg.version )
		.option('--danafile [path]', 'Specify the danafile path.')
		.option('--cwd [path]', 'Specify the working directory.')
		.option('--env [name]', 'environment, default: process.env.NODE_ENV || development');

	helpers.requireDirFiles(path.join(__dirname, './commands') + '/*.js').then(commandFiles => {
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
