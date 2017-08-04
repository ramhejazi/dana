const Diff = require('./Diff');
const helpers = require('./helpers');
const fs = require('fs-extra');
const path = require('path');
const tildify = require('tildify');
const mysql = require('mysql2/promise');
const sql  = require('./sql');
const Promise = require('bluebird');
const _ = require('lodash');
const log = require('./log');
const Table = require('./Table');
const yaml = require('js-yaml');

module.exports = class Migrate {

	constructor(dana) {
		this.dana = dana;
		this._connection = null;
	}

	run(cmd, verbose) {
		if ( cmd === 'make' )
			return this['_' + cmd](verbose);
		return this._runWithConnection(cmd, verbose);
	}

	_runWithConnection(cmd, verbose) {
		return this._createConnection().then(() => {
			return this['_' + cmd](verbose);
		}).tap(() => this._endConnection());
	}


	_make(verbose = false) {
		return Promise.all([
			this.dana.schema.getModels(),
			this.getLastMigrationSpecs()
		]).spread((cSpecs, oldSchema = []) => {
			const diff = new Diff(oldSchema, cSpecs.parsed);
			if (!diff.hasChanged()) {
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

	_formatSQL(query, values) {
		if (!values) return query;
		return query.replace(/\:(\w+)/g, (txt, key) => {
			if (values.hasOwnProperty(key)) {
				return this._connection.escape(values[key]);
			}
			return txt;
		});
	}

	_addMigrationRow(no, migrationFile) {
		return this._query('INSERT INTO dana_migrations(name, batch) VALUES(:name, :batch)', {
			name: migrationFile.name,
			batch: no
		});
	}

	_removeMigrationRow(migrationFile) {
		return this._query('DELETE FROM dana_migrations where name=:name', {
			name: migrationFile.name
		});
	}

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

	_hasTable(table) {
		return this._query(`
			SELECT *
			FROM information_schema.tables
			WHERE table_schema = :database
			AND table_name = :tableName
			LIMIT 1;
		`, {
			database: this.dana.config('connection.database'),
			tableName: table
		}).then(rows => {
			return rows.length > 0;
		});
	}

	_query() {
		return this._connection.query(this._formatSQL(...arguments)).then(([rows]) => rows);
	}

	_createConnection() {
		const conConfig = this.dana.config('connection');
		if (!conConfig) {
			throw `Missing database connection configuation for the ${this.dana.env} environment!`;
		}
		conConfig.Promise = Promise;
		conConfig.multipleStatements= true;
		return mysql.createConnection(conConfig).then(connection => {
			this._connection = connection;
		});
	}

	_endConnection() {
		return this._connection.end();
	}

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

	getRunMigrationList() {
		return this._query('SELECT * FROM dana_migrations ORDER BY batch asc;');
	}

	getMigrationFiles() {
		let migrationsDir = path.join(this.dana.config('baseDir'), 'migrations');
		return helpers.readDir(migrationsDir + '/*.yml', false).then(files => {
			return files.sort((a, b) => +a.name > +b.name);
		});
	}

	getLastMigrationSpecs() {
		return this.getMigrationFiles().then(files => {
			const latest = files.pop();
			if (!latest) return [];
			return helpers.readYamlFile(latest.path).then(contents => {
				return Table.normalizeSpecs(JSON.parse(contents.specs));
			});
		});
	}

	getMigrationData() {
		return Promise.all([
			this.getRunMigrationList(),
			this.getMigrationFiles()
		]).tap(this.constructor.validateMigrationData);
	}

	static validateMigrationData([rows, files]) {
		let rowNames = _.map(rows, 'name');
		let fileNames = _.map(files, 'name');
		let diff = _.difference(rowNames, fileNames);
		if (diff.length) {
			throw new Error(
				`Currupt migration directory detected. The are ${diff.length} missing migration file(s): \n${diff.join('\n')}`
			);
		}
		let unordered = rowNames.filter((el, index) => {
			return fileNames.indexOf(el) !== index;
		});
		if ( unordered.length ) {
			throw new Error(
				`Corrupt migration directory detected. There are ${unordered.length} out of order migration files: \n${unordered.join('\n')}`
			);
		}
	}

};
