const fs       = require('fs-extra')
	, Promise    = require('bluebird')
	, _          = require('lodash')
	, __         = require('util').format
	, Table      = require('./Table')
	, path       = require('path')
	, shortid    = require('shortid')
	, log        = require('./log')
	, helpers    = require('./helpers')
	, messages   = require('../messages/en').schema
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
	* @param {boolean} verbose Logging flag, when `true` all actions are reported
	* @returns {Promise}
	*/
	init(verbose) {
		return Promise.all([
			this._ensureDanaConfigFile(verbose),
			this._ensureDanaDirectories(verbose)
		]);
	}

	/**
	 * Create danafile.js by copying ../danafile.js template file
	 * @returns {Promise}
	 */
	_ensureDanaConfigFile() {
		const configFilePath = this.getDanaConfigFilePath();
		return fs.pathExists(configFilePath).then(exists => {
			if ( exists ) {
				log.warn( __(messages.CONFIG_FILE_EXISTS, tildify(configFilePath)) );
			} else {
				return fs.copy(
					this.getOriginalDanaConfigFilePath(),
					configFilePath
				).then(() => {
					log.success( messages.CONFIG_FILE_CREATED );
				});
			}
		});

	}

	/**
	* Ensure `models` and `migrations` directories exist.
	* Create directory that doesn't exist in the target project base directories
	* @return {Promise}
	*/
	_ensureDanaDirectories(verbose) {
		if ( verbose ) {
			log.info( messages.ENSURING_DIRS );
		}
		return Promise.each(['models', 'migrations'], dir => {
			const dirPath = path.join(this.dana.config('baseDir'), dir);
			return fs.pathExists(dirPath).then(exists => {
				if ( exists ) {
					log.warn( __(messages.DIR_EXISTS, tildify(dirPath)) );
				} else {
					if ( verbose ) {
						log.info( __(messages.CREATING_DIR, tildify(dirPath)) );
					}
					return fs.ensureDir(dirPath).then(() => {
						log.success( __(messages.DIR_CREATED, tildify(dirPath)) );
					});
				}
			});
		});
	}

	/**
	 * Get project models and parse/validate them
	 * @return {Promise<object|error>}
	 * @property {object} returned.parsed   Collection of parsed models
	 * @property {object} returned.original Collection of raw models
	 */
	getModels() {
		return this.requireModelFiles().then(models => {
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
	 * @return {array}
	 */
	getModelTableNames(verbose) {
		return this.requireModelFiles().then(files => {
			return files.map(file => {
				const fileSrcType = helpers.getType(file.src);
				const tableName = file.src.tableName;
				if ( verbose && fileSrcType !== 'object' ) {
					log.warn(__(messages.INVALID_MODEL_EXPORTED_CONTENT,
						tildify(file.path),
						fileSrcType
					));
				} else {
					if ( verbose && tableName !== file.name ) {
						log.warn(__(messages.MODEL_NAME_NOT_EQUAL_TO_TABLENAME,
							tildify(file.path),
							tableName
						));
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
	 * Create model files by using tableNames
	 * @param   {array} tableNames array of table names
	 * @returns {Promise}
	 */
	createModels(tableNames, verbose) {
		// filter invalid table names
		const invalids = tableNames.filter(tableName => {
			return !Table.isValidName(tableName);
		});

		if ( invalids.length ) {
			log.fail(__(
				messages.INAVLID_TABLE_NAMES,
				log.listify(invalids),
				Table.getNameRegex()
			), true);
			// uncessary as the log.fail will terminate the process
			// just for the sake of testing!
			return Promise.resolve(invalids);
		}

		if ( verbose ) {
			log.info(__(
				messages.CREATING_MODELS,
				tableNames.length,
				log.listify(tableNames.map(el => el + '.js'))
			));
		}

		return this.getModelTableNames(verbose).then(cTables => {
			const cTableNames = _.map(cTables, 'tableName');
			const cModelFileNames = _.map(cTables, 'filename');
			/**
			 * Check already existing models against new table names
			 */
			const dTableNames = tableNames.filter(name => {
				return cTableNames.includes(name);
			});

			if ( dTableNames.length ) {
				log.fail(__(
					messages.EXISTING_MODEL_FOR_TABLES,
					log.listify(dTableNames)
				), true);
				// just for testing!
				return dTableNames;
			}

			// Get models that have similar file names (tableNames)
			// with different tableNames
			const dFiles = tableNames.filter(name => {
				return cModelFileNames.includes(name);
			});

			if ( dFiles.length ) {
				log.fail(__(
					messages.EXISTING_MODEL_NAMES,
					log.listify(dFiles)
				), true);
				return dFiles;
			}

			/**
			 * Evrything is okay to create new the tables
			 */
			return Promise.map(tableNames, (tableName) => {
				return this._createModel(tableName);
			});
		});
	}

	/**
	 * Create a new model
	 * @param {string} tableName
	 * e
	 * @return {Promise<object>}
	 * @property {string} path Path of the created file
	 * @property {string} tableName
	 */
	_createModel(tableName) {
		const modelPath = this.getModelPathForTableName(tableName);
		const modelContent = this.constructor.defineBaseModel(tableName);
		return fs.writeFile(modelPath, modelContent).then(() => {
			return { path: modelPath, tableName};
		});
	}

	/**
	 * Get absolute file path for a model by it's tableName
	 * @return {string}
	 */
	getModelPathForTableName(tableName) {
		return path.join(this.getModelsDirPath(), tableName) + '.js';
	}

	/**
	* Get absolute path of target project's "models" directory.
	* @return {string}
	*/
	getModelsDirPath() {
		return path.join(this.dana.config('baseDir'), 'models');
	}

	requireModelFiles() {
		let modelsDir = this.getModelsDirPath();
		return helpers.requireDirFiles(modelsDir + '/*.js');
	}

	/**
	 * Return danafile.js path by using `baseDir` option
	 * @return {string}
	 */
	getDanaConfigFilePath() {
		return path.join(this.dana.config('baseDir'), 'danafile.js');
	}

	/**
	 * Return danafile.js path by using `baseDir` option
	 * @return {string}
	 */
	getOriginalDanaConfigFilePath() {
		return path.join(__dirname, '..', 'danafile.js');
	}


	/**
	 * Generates basic contents of a model
	 * @param  {string} tableName
	 * @param {boolean} raw Don't stringify the object return the raw model
	 * @return {string} contents for the new model
	 */
	static defineBaseModel(tableName, raw = false) {
		const id = shortid.generate();
		const model = {
			tableName,
			schema: {
				columns: {}
			},
			_fid: id
		};
		if ( raw ) {
			return model;
		}
		const fileContent = JSON
			.stringify(model, null, 4);
			//.replace(/"([^(")"]+)":/g, '$1:');

		return `module.exports = ${fileContent}`;
	}

};
