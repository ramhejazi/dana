const
	helpers = require('../../src/lib/helpers')
	, fs = require('fs-extra')
	, sinon = require('sinon')
	, _ = require('lodash')
	, log = require('../../src/lib/log')
	, originalGetFile = helpers._getFile
	, originalEcho = log.echo
	, mockFs = require('mock-fs');

module.exports = {
	mockFs(dirs) {
		helpers._getFile = function(path) {
			const contents = fs.readFileSync(path, 'utf-8').replace('module.exports = ', '');
			return eval('(' + contents + ')');
		};
		mockFs(dirs);
	},

	unMockFs() {
		helpers._getFile = originalGetFile;
		mockFs.restore();
	},

	mockDana(cwd) {
		return {
			__configs: {
				baseDir: cwd
			},
			config(configName) {
				return configName === undefined
					? this.__configs
					: _.get(this.__configs, configName);
			}
		};
	},

	mockLogger() {
		log.echo = sinon.spy();
	},

	unmockLogger() {
		log.echo = originalEcho;
	},
};
