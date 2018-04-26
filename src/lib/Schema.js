const fs       = require('fs-extra')
	, Promise    = require('bluebird')
	, Table      = require('./Table')
	, DanaError  = require('../errors').DanaError
	, path       = require('path')
	, shortid    = require('shortid')
	, _          = require('lodash')
	, log        = require('./log')
	, helpers    = require('./helpers')
	, tildify    = require('tildify');

/**
 * @class for managing required directories and config file for dana
 * @author Ram Hejazi
 */
module.exports = class Schema {

	/**
	* Creates a schema object
  *
	* @param {object} dana Instance of dana
	*/
	constructor(dana) {
		this.dana = dana;
	}

	/**
	* Creates dana required directories and danafile.js (config) file
	* @param {boolean} verbose Logging flag, when `true` main actions are reported
	* @returns {Promise}
	*/
	init(verbose) {
		return Promise.all([
			this._ensureDirectories(verbose),
			this._createDanaFile(verbose)
		]);
	}

	/**
	 * Create danafile.js by copying ../danafile.js template file
	 * @returns {Promise}
	 */
	_createDanaFile() {
		return fs.copy(
			path.join(__dirname, '..', 'danafile.js'),
			path.join(this.config('baseDir'), 'danafile.js')
		).then(() => {
			log.success('Created danafile.js successfully.');
		});
	}

	/**
	 * Create model files by using tableNames
	 * @param   {array} tableNames array of table names
	 * @returns {Promise}
	 */
	createModels(tableNames, verbose) {
		// filter invalid table names
		const invalids = tableNames.reduce((ret, tableName) => {
			if ( !Table.isValidName(tableName) )
				ret.push(tableName);
			return ret;
		}, []);

		if (invalids.length) {
			const l = invalids.length;
			return Promise.reject(
				new DanaError(
					`There ${l === 1 ? 'is': 'are'} ${l} invalid table name(s): \n - ${invalids.join('\n - ')} \nTable names should match /^[a-z]([_]?[a-z]+)*$/ regular expression. Aborting!`
				)
			);
		}

		if ( verbose ) {
			log.info(`${tableNames.length} model(s) will be created: \n - ${tableNames.join('\n - ')}`);
		}

		return this._getCurrentTableNames(verbose).then(currentTables => {
			const currentTableNames = _.map(currentTables, 'tableName');
			const currentModelFilenames = _.map(currentTables, 'filename');

			const duplicateTableNames = tableNames.filter(name => currentTableNames.includes(name));
			if (duplicateTableNames.length) {
				throw new DanaError(
					`There are existent model files for following table names: ${duplicateTableNames.join(', ')}`
				);
			}

			const duplicateModelFilenames = tableNames.filter(name => currentModelFilenames.includes(name));

			if (duplicateModelFilenames.length) {
				throw new DanaError(
					`Cannot create model(s) for the following table(s): ${duplicateModelFilenames.join(', ')}!\nReason: There is/are already existent file(s) with .js extension for the specified table(s) and creating new model(s) will overwrite it/them!`
				);
			}

			const baseDir = this.dana.config('baseDir');
			const fileDetails = tableNames.map(tableName => {
				return {
					path: path.join(baseDir, 'models', tableName + '.js'),
					tableName
				};
			});
			return Promise.map(fileDetails, (file) => {
				let model = this._defineBaseModel(file.tableName);
				return fs.writeFile(file.path, model).then(() => file);
			});
		});
	}

	/**
	* Ensure `models` and `migrations` directories exist.
	* Create directory that doesn't exist in the target project base directories
	* @return {Promise}
	*/
	_ensureDirectories(verbose) {
		return Promise.each(['models', 'migrations'], dir => {
			const dirPath = path.join(this.config('baseDir'), dir);
			return fs.pathExists(dirPath).then(exists => {
				if ( exists ) {
					if (verbose)
						log.warn(`Directory "${tildify(dirPath)}" already exists!`);
					return;
				} else {
					if (verbose)
						log.info(`Creating missing directory "${tildify(dirPath)}" ...`);
					return fs.ensureDir(dirPath).then(() => {
						log.success(`Directory "${tildify(dirPath)}" created!`);
					});
				}
			});
		});
	}

	getModels() {
		return this._getModelFiles().then(models => {
			return Promise.map(models, (modelFile) => {
				return new Table(modelFile).parse();
			}).then(parsedModels => {
				return {
					parsed: parsedModels,
					original: _.map(models, file => _.pick(file.src, [
						'tableName', 'schema', '_fid'
					]))
				};
			});
		});
	}

	/**
	 * Get current `tableName`s by analyzing models.
	 * it reads and returns the "tableName" and file "name"s of the models
   * as an array of objects
	 * @returns {array}
	 */
	_getCurrentTableNames(verbose) {
		return this._getModelFiles().then(files => {
			return files.map(file => {
				let fileSrcType = helpers.getType(file.src);
				let tableName;
				if ( verbose && fileSrcType !== 'object' ) {
					log.warn(`Model "${file.name}" exports a(n) "${fileSrcType}" instead of an object.`);
				} else {
					tableName = file.src.tableName;
					if ( verbose && tableName !== file.name ) {
						log.warn(`Model "${file.name}"'s filename is not equal to it's tableName "${tableName}"`);
					}
				}
				return {
					filename: file.name,
					tableName
				};
			});
		});
	}

	/**
	 * Generates basic contents of a model
	 * @param  {string} tableName
	 * @return {string} contents for the new model
	 */
	_defineBaseModel(tableName) {
		const id = shortid.generate();
		const model = JSON.stringify({
			tableName,
			schema: {
				columns: {}
			},
			_fid: id
		}, null, 4).replace(/"([^(")"]+)":/g, '$1:');

		return `module.exports = ${model}`;
	}

	/**
	* Return target project's "models" directory path.
	* @return {string}
	*/
	_getModelsPath() {
		return path.join(this.dana.config('baseDir'), 'models');
	}

	_getModelFiles() {
		let modelsDir = this._getModelsPath();
		return helpers.readDir(modelsDir + '/*.js');
	}

};
