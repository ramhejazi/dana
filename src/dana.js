const _ = require('lodash');

const Schema = require('./lib/Schema');
const Migrate = require('./lib/Migrate');
const datatypes = require('./datatypes');

const dana = {
	/**
	 * Get config by name
	 * returns all the configs when configName is undefined
	 * @param  {undefined|string} prop name of the config
	 * @return {any}
	 */
	config(configName) {
		return configName === undefined ? this.__configs : _.get(this.__configs, configName);
	},

	datatypes,

	get migrate() {
		return new Migrate(this);
	},

	get schema() {
		return new Schema(this);
	}
};


module.exports = function(configs = {}, env) {
	const instance = Object.create(dana);
	instance.env = env || 'development';
	instance.__configs = Object.assign({
		defaultCharset: 'utf8mb4',
		defaultCollation: 'utf8mb4_unicode_ci'
	}, configs);
	return instance;
};
