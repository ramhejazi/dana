const Diff  = require('./Diff')
	, _       = require('lodash')
	, __         = require('util').format
	, helpers = require('./helpers')
	, fs      = require('fs-extra')
	, path    = require('path')
	, tildify = require('tildify')
	, mysql   = require('mysql2/promise')
	, chalk   = require('chalk')
	, sql     = require('./sql')
	, Promise = require('bluebird')
	, messages   = require('../messages/en').migrate
	, log     = require('./log')
	, Table   = require('./Table')
	, yaml    = require('js-yaml');

/**
	@class responsible for creating, executing, rollbacking and basically
	managing migration files.
	@author Ram Hejazi
*/
module.exports = class Migrate {

	/**
	 * Create a new migrate instance
	 *
	 * @param dana a dana instance
	 */
	constructor(dana) {
		this.dana = dana;
		this._connection = null;
	}

	/**
	 * Execute a migrate action
	 * @param {string} cmd Name of action
	 * @param {boolean} verbose Flag for logging main actions
	 * @returns {Promise}
	 */
	run(cmd, verbose) {
		if ( cmd === 'make' )
			return this['_' + cmd](verbose);
		return this._runWithConnection(cmd, verbose);
	}

	/**
	 * Make a database connection, run a migration action and close the connection
	 * @param {string} cmd Name of the action: [rollback, latest]
	 * @param {boolean} verbose=false Log main actions
	 * @returns {Promise}
	 */
	_runWithConnection(cmd, verbose) {
		return this._createConnection().catch(e => {
			log.fail(__(messages.DB_CONNECTION_ERROR, chalk.underline(e.message)), true);
			// just for testing purposes! log.fail exit the process in normal use!
			throw new Error('DB_CONNECTION_ERROR');
		}).then(() => {
			return this['_' + cmd](verbose);
		}).tap(() => this._endConnection());
	}


	/**
	 * Make a dana migartion file by comaparing schemata
	 * @param {boolean} verbose Log main actions
	 * @returns {Promise}
	 */
	_make() {
		return Promise.all([
			this.dana.schema.getModels(),
			this.getLastMigrationSpecs()
		]).spread((modelSpecs, lastSpecs) => {
			const diff = new Diff(lastSpecs, modelSpecs.parsed);
			if ( !diff.hasChanged() ) {
				return log.info(messages.NO_DIFF, true);
			}
			const data = Object.assign(diff.getMigrationData(), {
				specs: JSON.stringify(modelSpecs.original)
			});
			return this._createMigrationFile(data).then(filePath => {
				log.success(__(
					messages.CREATED_MIGRATION_FILE,
					tildify(filePath)
				), true);
				return filePath;
			});
		});
	}

	/**
	 * Run all non-executed migration files (if any)
	 * @param {boolean} verbose Log main actions
	 * @returns {Promise}
	 */
	_latest(verbose) {
		return this._ensureDanaTable(verbose)
			.then(() => this.getMigrationData())
			.spread((rows, files) => {
				const batchNo = (rows.length > 0 ? +_.last(rows).batch : 0) + 1;
				const remainingFiles = files.slice(rows.length);
				if ( remainingFiles.length === 0 ) {
					return log.info(messages.ALREADY_MIGRATED, true);
				}
				return Promise.reduce(remainingFiles, (p, migrationFile) => {
					return helpers.readYamlFile(migrationFile.path).then(migration => {
						return this._query(migration.up).then(() => {
							return this._addMigrationRow(batchNo, migrationFile.name);
						});
					});
				}, 0).then(() => {
					log.success(__(
						messages.MIGRATED_TO_LATEST,
						remainingFiles.length,
						batchNo
					), true);
				});
			});
	}

	/**
	 * Rollback the last batch of migrated migration files (if any)
	 * @param {boolean} verbose
	 * @returns {Promise}
	 */
	_rollback(verbose) {
		return this._ensureDanaTable(verbose)
			.then(() => this.getMigrationData())
			.spread((rows, files) => {
				if ( rows.length === 0 ) {
					return log.info(messages.NO_ROWS_TO_ROLLBACK, true);
				}
				const lastBatchNo = +_.last(rows).batch;
				const rollbackRows = rows.filter(row => {
					return lastBatchNo === +row.batch;
				});
				const rollbackFileNames = _.map(rollbackRows, 'name');
				const rollbackFiles = _.filter(files, file => {
					return rollbackFileNames.includes(file.name);
				});

				if ( verbose ) {
					log.info(__(
						messages.ROLLBACKING,
						rollbackRows.length,
						lastBatchNo,
						log.listify(rollbackFiles.map(el => el.path))
					));
				}

				return Promise.reduce(rollbackFiles.reverse(), (ret, migrationFile) => {
					return helpers.readYamlFile(migrationFile.path).then(migration => {
						return this._query(migration.down).then(() => {
							return this._removeMigrationRow(migrationFile.name);
						});
					});
				}, 0).then(() => {
					log.success(__(
						messages.ROLLBACKED_MIGRATIONS,
						rollbackFiles.length,
						lastBatchNo
					), true);
				});
			});
	}

	/**
	 * Create a new migration file
	 * @param {object} data
	 * @property {string} up Up SQL
	 * @property {string} down Down SQL
	 * @property {string} specs JSON representation of the currect models
	 */
	_createMigrationFile(data) {
		const filename = helpers.createMigrationFileName() + '.yml';
		const filePath = path.join(this.dana.config('baseDir'), 'migrations', filename);
		return fs.writeFile(filePath, yaml.safeDump(data)).then(() => filePath);
	}

	/**
	 * Add migration row for a ran executed migration file
	 * This function is called once for each migration file
	 * @param {number} batchNumber Number of the current group/batch of migration files
	 * @param {object} migrationName Name of migration
	 * @returns {Promise}
	 */
	_addMigrationRow(batchNumber, migrationName) {
		return this._query('INSERT INTO dana_migrations(name, batch) VALUES(:name, :batch)', {
			name: migrationName,
			batch: batchNumber
		});
	}

	/**
	 * Remove a migration row from dana_migrations table based on file name
	 * @param {object} migrationName Name of migration
	 * @returns {Promise}
	 */
	_removeMigrationRow(migrationName) {
		return this._query('DELETE FROM `dana_migrations` where name=:name', {
			name: migrationName
		});
	}

	/**
	 * Make sure dana_migrations table exists, if it does't exist, create it
	 * @returns {Promise}
	 */
	_ensureDanaTable() {
		return this._hasTable('dana_migrations').then(has => {
			if (!has) {
				log.warn('missing "dana_migrations" table detected!');
				log.info('creating "dana_migrations" table ...');
				return this._createDanaMigrationTable().then(() => {
					log.success('required dana migration table (`dana_migrations`) successfully created!');
				});
			}
		});
	}

	/**
	 * Check existence of a table by querying database
	 * @param {string} tableName
	 * @returns {Promise<boolean>}
	 */
	_hasTable(tableName) {
		return this._query(`SHOW TABLES LIKE '${tableName}';`).then(rows => {
			return rows.length > 0;
		});
	}

	/**
	 * Create dana_migrations table
	 * @returns {Promise}
	 */
	_createDanaMigrationTable() {
		const q = sql.createTable(Table.normalizeSpec({
			tableName: 'dana_migrations',
			schema: {
				columns: {
					name: 'varchar',
					batch: 'int',
					date: 'timestamp'
				}
			}
		})).join('');
		return this._query(q);
	}

	/**
	 * Get dana_migrations table's rows, sorted by `batch` field in ascending order
	 * @returns {Promise}
	 */
	getMigrationRows() {
		return this._query('SELECT * FROM `dana_migrations` ORDER BY `batch` ASC;');
	}


	/**
	 * Read models files, sorted by file name in ascending order
	 * @returns {Promise<array>}
	 */
	getMigrationFiles() {
		let migrationsDir = path.join(this.dana.config('baseDir'), 'migrations');
		return helpers.requireDirFiles(migrationsDir + '/*.yml', false).then(files => {
			return files.sort((a, b) => +a.name > +b.name);
		});
	}

	/**
	 * Get, normalize and return `specs` property of the last migration file
	 * @returns {Promise<object>}
	 */
	getLastMigrationSpecs() {
		return this.getMigrationFiles().then(files => {
			const latest = files.pop();
			if (!latest) return [];
			return helpers.readYamlFile(latest.path).then(contents => {
				return Table.normalizeSpecs(JSON.parse(contents.specs));
			});
		});
	}

	/**
	 * Get, validate and return dana_migrations table's rows and migration files
	 * @returns {Promise<array>} index 0: migration rows, index 1: migration files
	 */
	getMigrationData() {
		return Promise.all([
			this.getMigrationRows(),
			this.getMigrationFiles()
		]).tap(([rows, files]) => {
			this.constructor.validateMigrationData(rows, files);
		});
	}

	/**
	 * Validate migration data for making sure migration rows and files
	 * are untouched
	 * @param {array} rows Current dana_migrations rows
	 * @param {array} files Current normalized migration files
	 */
	static validateMigrationData(rows, files) {
		const rowNames = _.map(rows, 'name');
		const fileNames = _.map(files, 'name');

		// check missing migration files
		const diff = _.difference(rowNames, fileNames);
		if ( diff.length ) {
			throw new Error(__(
				messages.CURRUPT_MIGRATION_DIR,
				diff.length,
				log.listify(diff.map(o => o + '.yml'))
			));
		}

		// check unordered list of migrations
		const unordered = rowNames.filter((el, index) => {
			return fileNames.indexOf(el) !== index;
		});
		if ( unordered.length ) {
			throw new Error(__(
				messages.UNORDERED_MIGRATION_FILES,
				unordered.length,
				log.listify(unordered.map(o => o + '.yml'))
			));
		}
	}

	/**
	 * Format SQL by replacing :placeholders with escaped corresponding values
	 * @see https://github.com/mysqljs/mysql#custom-format
	 * @param {string} query Query to be modified
	 * @param {object} values Values as `key:value` pairs. Each matching :placeholder
	 * with `key` is replaced with key's value.
	 *
	 * @example
	 * 	formatSQL('select * from :tableName;', { tableName: 'tests' })
	 *  // select * from tests;
	 */
	_formatSQL(query, values) {
		if (!values) return query;
		return query.replace(/:(\w+)/g, (txt, key) => {
			if (values.hasOwnProperty(key)) {
				return this._connection.escape(values[key]);
			}
			return txt;
		});
	}

	/**
	 * Create a mysql2 connection by using user-defined configuration
	 * @returns {Promise}
	 */
	_createConnection() {
		const conConfig = this.dana.config('connection');
		if (!conConfig) {
			throw new Error(__(
				messages.MISSING_DB_CONFIG,
				this.dana.env
			));
		}
		conConfig.Promise = Promise;
		conConfig.multipleStatements = true;
		return mysql.createConnection(conConfig).then(connection => {
			this._connection = connection;
		});
	}

	/**
	 * Close an active mysql2 connection to database
	 * @returns {Promise}
	 */
	_endConnection() {
		return this._connection.end();
	}

	/**
	 * Execute a SQL query
	 * @param {string} query
	 * @param {object} values
	 * @returns {Promise<any>}
	 */
	_query(query, values) {
		let queryStr = this._formatSQL(query, values);
		return this._connection.query(queryStr).then(([rows]) => rows);
	}
};
