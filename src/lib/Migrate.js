const Diff  = require('./Diff')
	, _       = require('lodash')
	, helpers = require('./helpers')
	, fs      = require('fs-extra')
	, path    = require('path')
	, tildify = require('tildify')
	, mysql   = require('mysql2/promise')
	, sql     = require('./sql')
	, Promise = require('bluebird')
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
		return this._createConnection().then(() => {
			return this['_' + cmd](verbose);
		}).tap(() => this._endConnection());
	}


	/**
	 * Make a dana migartion file by comaparing schemata
	 * @param {boolean} verbose Log main actions
	 * @returns {Promise}
	 */
	_make(verbose = false) {
		return Promise.all([
			this.dana.schema.getModels(),
			this.getLastMigrationSpecs()
		]).spread((cSpecs, oldSchema = []) => {
			const diff = new Diff(oldSchema, cSpecs.parsed);
			if ( !diff.hasChanged() ) {
				return [
					{
						type: 'info',
						message: 'No schema change detected.'
					}
				];
			}
			const data = diff.getMigrationData();
			data.specs = JSON.stringify(cSpecs.original);
			const filename = helpers.createMigrationFileName(diff) + '.yml';
			const filePath = path.join(this.dana.config('baseDir'), 'migrations', filename);
			return fs.writeFile(filePath, yaml.safeDump(data)).then(() => {
				const logs = verbose ? diff.getLogs() : [];
				logs.push({
					type: 'success',
					message: `Successfully created a migration file => ${tildify(filePath)}`
				});
				return logs;
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
			.then(([rows, files]) => {
				const curBatchNo = rows.length > 0 ? +_.last(rows).batch : 0;
				const batchNo = curBatchNo + 1;
				const remaining = files.slice(rows.length);
				if ( remaining.length === 0 ) {
					return log.info('Already to the latest version!');
				}
				return Promise.reduce(remaining, (p, migrationFile) => {
					return helpers.readYamlFile(migrationFile.path).then(migration => {
						return this._query(migration.up).then(() => {
							return this._addMigrationRow(batchNo, migrationFile);
						});
					});
				}, 0).then(() => {
					return [{
						type: 'success',
						message: `Successfully executed ${remaining.length} migration files.`
					}];
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
			.then(([rows, files]) => {
				if ( rows.length === 0 ) {
					return log.info('No migrated data to downgrade!');
				}
				const lastBatchNo = rows.length > 0 ? +_.last(rows).batch : 0;
				const rollbackRows = rows.filter(row => {
					return lastBatchNo === +row.batch;
				});
				const rollbackFileNames = _.map(rollbackRows, 'name');
				const rollbackFiles = _.filter(files, file => {
					return rollbackFileNames.includes(file.name);
				});

				if ( verbose ) {
					log.info(`Rollbacking ${rollbackRows.length} migrations with batch number of "${lastBatchNo}".`);
					log.info(`Migration file names are: \n - ${rollbackFileNames.join('\n - ')}`);
				}

				return Promise.reduce(rollbackFiles.reverse(), (ret, migrationFile) => {
					return helpers.readYamlFile(migrationFile.path).then(migration => {
						return this._query(migration.down).then(() => {
							return this._removeMigrationRow(migrationFile);
						});
					});
				}, 0).then(() => {
					return [{
						type: 'success',
						message: `Successfully rollbacked ${rollbackFiles.length} migration files. Batch number was "${lastBatchNo}".`
					}];
				});
			});
	}

	/**
	 * Format SQL by replacing :placeholders with escaped corresponding values
	 * @param {string} query Query to be modified
	 * @param {object} values Values as `key:value` pairs. Each matching :placeholder
	 * with `key` is replaced with key's value.
	 *
	 * @example
	 * 	_formatSQL('select * from :tableName;', { tableName: 'tests' })
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
	 * Add migration row for a ran executed migration file
	 * This function is called once for each migration file
	 * @param {number} batchNumber Number of the current group/batch of migration files
	 * @param {object} migrationFile An object representing a migration file
	 * @returns {Promise}
	 */
	_addMigrationRow(batchNumber, migrationFile) {
		return this._query('INSERT INTO dana_migrations(name, batch) VALUES(:name, :batch)', {
			name: migrationFile.name,
			batch: batchNumber
		});
	}

	/**
	 * Remove a migration row from dana_migrations table based on file name
	 * @param {object} migrationFile An object representing a migration file
	 * @returns {Promise}
	 */
	_removeMigrationRow(migrationFile) {
		return this._query('DELETE FROM dana_migrations where name=:name', {
			name: migrationFile.name
		});
	}

	/**
	 * Make sure dana_migration table exists, if it does't exist, create it
	 * @returns {Promise}
	 */
	_ensureDanaTable() {
		return this._hasTable('dana_migrations').then(has => {
			if (!has) {
				log.warn('Missing "dana_migrations" table.');
				log.info('Creating "dana_migrations" table...');
				return this._createDanaMigrationTable().then(() => {
					log.success('dana migration table successfully created!');
				});
			}
		});
	}

	/**
	 * Check existence of a table by querying database
	 * @param {string} tableName
	 * @returns {promise->boolean}
	 */
	_hasTable(tableName) {
		return this._query(`
			SELECT *
			FROM information_schema.tables
			WHERE table_schema = :database
			AND table_name = :tableName
			LIMIT 1;
		`, {
			database: this.dana.config('connection.database'),
			tableName
		}).then(rows => {
			return rows.length > 0;
		});
	}

	/**
	 * Execute a SQL query
	 * @param {string} query
	 * @param {object} values
	 * @returns {Promise<any>}
	 */
	_query(query, values) {
		return this._connection.query(this._formatSQL(query, values)).then(([rows]) => rows);
	}

	/**
	 * Create a mysql2 connection by using user-defined configuration
	 * @returns {Promise}
	 */
	_createConnection() {
		const conConfig = this.dana.config('connection');
		if (!conConfig) {
			throw `Missing database connection configuation for the ${this.dana.env} environment!`;
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
	getRunMigrationList() {
		return this._query('SELECT * FROM dana_migrations ORDER BY batch asc;');
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
	 * @returns {Promise<array>}
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
	 * Get, validate and return dana_migration table's rows and migration files
	 * @returns {Promise<array>} index 0: migration rows, index 1: migration files
	 */
	getMigrationData() {
		return Promise.all([
			this.getRunMigrationList(),
			this.getMigrationFiles()
		]).tap(([rows, files]) => this.constructor.validateMigrationData(rows, files));
	}

	/**
	 * Validate migration data for making sure migration rows and files
	 * are untouched
	 */
	static validateMigrationData(rows, files) {
		let rowNames = _.map(rows, 'name');
		let fileNames = _.map(files, 'name');
		let diff = _.difference(rowNames, fileNames);
		if (diff.length) {
			throw new Error(
				`currupt migration directory detected. The are ${diff.length} missing migration file(s): ${log.listify(diff)}`
			);
		}
		let unordered = rowNames.filter((el, index) => {
			return fileNames.indexOf(el) !== index;
		});
		if ( unordered.length ) {
			throw new Error(
				`corrupt migration directory detected. There are ${unordered.length} out of order migration files: ${log.listify(unordered)}`
			);
		}
	}

};
