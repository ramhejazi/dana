const
	Migrate = require('../../../src/lib/Migrate')
	, Schema = require('../../../src/lib/Schema')
	, Table = require('../../../src/lib/Table')
	, Diff = require('../../../src/lib/Diff')
	, Promise = require('bluebird')
	, expect = require('expect.js')
	, messages = require('../../../src/messages/en').migrate
	, _ = require('lodash')
	, __ = require('util').format
	, mocker = require('../_mocker')
	, tildify = require('tildify')
	, yaml    = require('js-yaml')
	, log = require('../../../src/lib/log')
	, FAKE_DIR = '/home/username/fake_dir';

/**
 * Create a Migrate instance
 * This function exist for reading test cleaner!
 */
function migrate() {
	return new Migrate(mocker.mockDana(FAKE_DIR));
}

describe('lib/Migrate', function() {
	it('should create an instance properly', function() {
		const dana = mocker.mockDana(FAKE_DIR);
		const migrate = new Migrate(dana);
		expect(migrate.dana).to.eql(dana);
	});

	describe('.formatSQL()', function() {
		it('replace the params properly!', function() {
			const dana = mocker.mockDana(FAKE_DIR);
			const migrate = new Migrate(dana);
			migrate._connection = {
				escape(el) { return el; }
			};
			const result = migrate._formatSQL('INSERT INTO dana_migrations(name, batch) VALUES(:name, :batch)', {
				name: '2018_12_02',
				batch: 2
			});
			expect(result).to.eql('INSERT INTO dana_migrations(name, batch) VALUES(2018_12_02, 2)');
			// no values
			expect(migrate._formatSQL('SELECT * FROM :tbl')).to.eql('SELECT * FROM :tbl');
			expect(migrate._formatSQL('SELECT :column FROM :tbl', {
				column: 'name'
			})).to.eql('SELECT name FROM :tbl');
		});
	});

	describe('.validateMigrationData()', function() {
		it('should pass for valid data', function() {
			const files = [{
				name: '2018_12_01'
			}, {
				name: '2018_12_02'
			}];
			const rows = [{
				name: '2018_12_01'
			}, {
				name: '2018_12_02'
			}];
			expect(Migrate.validateMigrationData(rows, files)).to.eql(undefined);
		});


		it('should throw CURRUPT_MIGRATION_DIR for invalid data', function() {
			const rows = [{
				name: '2018_12_01'
			}, {
				name: '2018_12_02'
			}, {
				name: '2018_12_03'
			}, {
				name: '2018_12_04'
			}];
			const files = [{
				name: '2018_12_01'
			}, {
				name: '2018_12_02'
			}];
			expect(Migrate.validateMigrationData).withArgs(rows, files).to.throwException(e => {
				const expectedMessage = __(
					messages.CURRUPT_MIGRATION_DIR,
					2,
					log.listify(['2018_12_03', '2018_12_04'].map(o => o + '.yml'))
				);
				expect(e.message).to.eql(expectedMessage);
			});
		});

		it('should throw UNORDERED_MIGRATION_FILES for invalid data', function() {
			const rows = [{
				name: '2018_12_01'
			}, {
				name: '2018_12_02'
			}];
			const files = [{
				name: '2018_12_03'
			}, {
				name: '2018_12_01'
			}, {
				name: '2018_12_04'
			}, {
				name: '2018_12_02'
			}];
			expect(Migrate.validateMigrationData).withArgs(rows, files).to.throwException(e => {
				const expectMessage = __(
					messages.UNORDERED_MIGRATION_FILES,
					2,
					log.listify(['2018_12_01', '2018_12_02'].map(o => o + '.yml'))
				);
				expect(e.message).to.eql(expectMessage);
			});
		});
	});

	describe('.getMigrationFiles()', function() {
		before(function() {
			mocker.mockFs({
				[`${FAKE_DIR}/migrations`]: {
					'2018_12_08_01_02.yml': 'fake_content',
					'2018_12_08_01_01.yml': 'fake_content',
					'2018_12_08_01_04.yml': 'fake_content',
					'2018_12_08_02_02.yml': 'fake_content'
				}
			});
		});
		after(mocker.unMockFs);

		it('should get the migration files properly', function() {
			return migrate().getMigrationFiles().then(files => {
				expect(files.length).to.eql(4);
				expect(_.map(files, 'name')).to.eql([
					'2018_12_08_01_01',
					'2018_12_08_01_02',
					'2018_12_08_01_04',
					'2018_12_08_02_02'
				]);
			});
		});
	});

	describe('.getLastMigrationSpecs()', function() {
		const expectedSpec = [{
			'tableName':'categories',
			'schema':{
				'columns':{},
				'charset':'utf8mb4',
				'collation':'utf8mb4_unicode_ci'
			},
			'_fid':'SybWCF_O3f'}
		];

		describe('no migration files', function() {
			before(function() {
				mocker.mockFs({
					[`${FAKE_DIR}/migrations`]: {}
				});
			});
			after(mocker.unMockFs);

			it('should return an empty array for no migration files!', function() {
				return migrate().getLastMigrationSpecs().then(specs => {
					expect(specs).to.eql([]);
				});
			});
		});

		describe('with migration files', function() {
			before(function() {
				mocker.mockFs({
					[`${FAKE_DIR}/migrations`]: {
						'2018_12_08_01_02.yml': 'fake_content',
						'2018_12_08_01_01.yml': 'fake_content',
						// last file when sorted asc properly!
						'2018_12_08_02_02.yml': `up: contents of the up param!\nspecs: >-\n ${JSON.stringify(expectedSpec)}`,
						'2018_12_08_01_04.yml': 'fake_content'
					}
				});
			});
			after(mocker.unMockFs);

			it('should read the last migration file specs properly', function() {
				return migrate().getLastMigrationSpecs().then(specs => {
					expect(specs).to.eql(Table.normalizeSpecs(expectedSpec));
				});
			});
		});
	});

	describe('._createConnection()', function() {
		it('should throw an error when there is db config', function() {
			const instance = migrate();
			instance.dana.__configs.connection = null;
			expect(instance._createConnection.bind(instance)).to.throwException(e => {
				expect(e.message).to.eql(__(
					messages.MISSING_DB_CONFIG,
					'testing'
				));
			});
		});

		it('should connect to database and disconnect with accepted config', function() {
			// test the ._createConnection() function and
			// remove possibly existing tables for nest tests!
			const instance = migrate();
			instance._createConnection().then(() => {
				return instance._query('DROP DATABASE test_db; CREATE DATABASE test_db;').then(() => {
					return instance._endConnection();
				});
			});
		});

	});

	describe('._hasTable()', function() {
		const instance = migrate();

		before(function() {
			return instance._createConnection();
		});

		after(function() {
			return instance._endConnection();
		});

		it('should return false for nonexistent table', function() {
			return instance._hasTable('dana_migrations').then(has => {
				expect(has).to.eql(false);
			});
		});
	});

	describe('._ensureDanaTable()', function() {
		const instance = migrate();

		before(function() {
			mocker.mockLogger();
			return instance._createConnection();
		});

		after(function() {
			mocker.unmockLogger();
			return instance._endConnection();
		});

		it('should create missing dana_migrations table', function() {
			return instance._ensureDanaTable().then(() => {
				return instance._hasTable('dana_migrations').then(has => {
					expect(has).to.eql(true);
					// should work without throwing error as it should detect the existing
					// table
					return instance._ensureDanaTable();
				});
			});
		});
	});

	describe('Migration row managing functions', function() {
		const instance = migrate();

		beforeEach(function() {
			return instance._createConnection();
		});

		afterEach(function() {
			return instance._endConnection();
		});

		it('.getMigrationRows() should return an empty list for no rows', function() {
			return instance.getMigrationRows().then(list => {
				expect(list).to.eql([]);
			});
		});

		it('._addMigrationRow() should add a row', function() {
			return instance._addMigrationRow(1, '2018_12_03_03_05_12').then(() => {
				return instance.getMigrationRows().then(list => {
					expect(list).to.have.length(1);
				});
			});
		});

		it('._removeMigrationRow() should remove a row', function() {
			return instance._removeMigrationRow('2018_12_03_03_05_12').then(() => {
				return instance.getMigrationRows().then(list => {
					expect(list).to.have.length(0);
				});
			});
		});
	});

	describe('.getMigrationData()', function() {
		const instance = migrate();
		const rowsExpected = ['2018_12_08_01_01', '2018_12_08_01_02'];
		before(function() {
			mocker.mockFs({
				[`${FAKE_DIR}/migrations`]: {
					'2018_12_08_01_01.yml': 'fake_content',
					'2018_12_08_01_02.yml': 'fake_content',
					'2018_12_08_01_09.yml': 'fake_content'
				}
			});
			return instance._createConnection().then(() => {
				return Promise.map(rowsExpected, el => {
					return instance._addMigrationRow(1, el);
				});
			});
		});

		after(function() {
			mocker.unMockFs();
			return Promise.map(rowsExpected, el => {
				return instance._removeMigrationRow(el);
			}).then(instance._endConnection.bind(instance));
		});

		it('should return expected data', function() {
			return instance.getMigrationData().spread((rows, files) => {
				expect(rows).to.have.length(2);
				expect(files).to.have.length(3);
			});
		});

	});

	describe('_make', function() {

		before(function() {
			mocker.mockLogger();
			mocker.mockFs({
				[FAKE_DIR]: {
					'migrations': {},
					'models': {
						'posts.js': Schema.defineBaseModel('posts'),
						'tags.js': Schema.defineBaseModel('tags')
					}
				}
			});
		});

		after(function() {
			mocker.unmockLogger();
			mocker.unMockFs();
		});

		it('should generate a migration file', function() {
			const instance = migrate();
			// add schema to the mocked dana
			instance.dana.schema = new Schema(instance.dana);
			return instance.run('make', true).then(filePath => {
				expect(filePath).to.be.a('string');
				// it should not generate a new migration for no change!
				return instance.run('make').then(result => {
					expect(result).to.eql(undefined);
					return instance.getMigrationFiles().then(files => {
						expect(files).to.have.length(1);
					});
				});
			});
		});

	});


	describe('_latest() & _rollback()', function() {
		before(function() {
			const first = new Diff([], [
				Schema.defineBaseModel('posts', true)
			]).getMigrationData();

			const second = new Diff([], [
				Schema.defineBaseModel('tags', true)
			]).getMigrationData();

			mocker.mockLogger();
			mocker.mockFs({
				[FAKE_DIR]: {
					'migrations': {
						'2018_12_08_02_02.yml': yaml.safeDump(first),
						'2018_12_08_02_03.yml': yaml.safeDump(second)
					}
				}
			});
		});

		after(function() {
			mocker.unmockLogger();
			mocker.unMockFs();
		});

		it('should run remaining migration files', function() {
			const instance = migrate();
			const runArgs = ['green', __(messages.MIGRATED_TO_LATEST, 2, 1), true];
			// latest and rollback are run by creating a db connection
			return instance.run('latest', true).then(() => {
				expect(log.echo.getCalls().length).to.eql(1);
				expect(log.echo.withArgs(...runArgs).calledOnce).to.be(true);
				// check existence of created tables!
				return instance._createConnection().then(() => {
					return Promise.map(['posts', 'tags'], name => {
						return instance._hasTable(name).then(has => {
							expect(has).to.eql(true);
						});
					});
				}).then(() => instance._endConnection());
			});
		});

		it('should just inform user that migration is up to date when all migrations hav been executed', function() {
			const runArgs = ['blue', messages.ALREADY_MIGRATED, true];
			log.echo.resetHistory();
			return migrate().run('latest', true).then(() => {
				expect(log.echo.getCalls().length).to.eql(1);
				expect(log.echo.withArgs(...runArgs).calledOnce).to.be(true);
			});
		});

	});

});
