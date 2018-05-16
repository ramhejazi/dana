const
	_           = require('lodash')
	, Schema    = require('./lib/Schema')
	, Migrate   = require('./lib/Migrate')
	, datatypes = require('./datatypes');


const dana = {
	/**
	 * instance configuration
	 */
	__configs: null,
	/**
	 * Get config item by name
	 * returns all the configs when configName is undefined
	 * @param  {undefined|string} prop name of the config
	 * @return {any}
	 */
	config(configName) {
		return configName === undefined
			? this.__configs
			: _.get(this.__configs, configName);
	},

	datatypes,

	get migrate() {
		return new Migrate(this);
	},

	get schema() {
		return new Schema(this);
	}
};

/**
 * @constructor for creating a dana instance
 * @param {object} configs
 * @param {string} configs.baseDir base directory of project
 * @param {object} configs.connection
 * @param {string} environment = 'development'
 *
 * @return {object} dana instance
 */
module.exports = function(configs = {}, environment = 'development') {
	const instance = Object.create(dana);
	instance.env = environment;
	instance.__configs = configs;
	return instance;
};

module.exports.datatypes = datatypes;
