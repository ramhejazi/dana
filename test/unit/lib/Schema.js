const
	Schema = require('../../../src/lib/Schema')
	, Table = require('../../../src/lib/Table')
	, expect = require('expect.js')
	, fs = require('fs-extra')
	, messages = require('../../../src/messages/en').schema
	, _ = require('lodash')
	, __ = require('util').format
	, mocker = require('../_mocker')
	, tildify = require('tildify')
	, log = require('../../../src/lib/log')
	, FAKE_DIR = '/home/username/fake_dir';

describe('lib/Schema', function() {
	it('should create an instance properly', function() {
		const dana = mocker.mockDana(FAKE_DIR);
		const schema = new Schema(dana);
		expect(schema.dana).to.eql(dana);
		expect(schema.getModelsDirPath()).to.eql(`${FAKE_DIR}/models`);
		expect(schema.getDanaConfigFilePath()).to.eql(`${FAKE_DIR}/danafile.js`);
	});

	describe('.defineBaseModel()', function() {
		it('should generate a valid basic model', function() {
			let model = Schema.defineBaseModel('table_name');
			expect(model).to.be.a('string');
			// remove module.exports
			model = model.replace('module.exports = ', '');
			// The module should be valid structure
			let modelContent = JSON.parse(model);
			expect(modelContent).to.only.have.keys([
				'tableName', 'schema', '_fid'
			]);
			expect(modelContent.tableName).to.eql('table_name');
			let model2 = Schema.defineBaseModel('table_name', true);
			expect(model2).to.be.an('object');
		});
	});

	describe('.init()', function() {
		before(function() {
			mocker.mockLogger();
			mocker.mockFs({
				[FAKE_DIR]: {},
				[process.cwd() + '/src/danafile.js']: 'dana mocked file!'
			});
		});
		after(function() {
			mocker.unMockFs();
			mocker.unmockLogger();
		});

		it('should generate danafile.js and required directories properly!', function() {
			const dana = mocker.mockDana(FAKE_DIR);
			const schema = new Schema(dana);
			const messagesForFreshSetup = [
				['green', messages.CONFIG_FILE_CREATED],
				['green', __(messages.DIR_CREATED, tildify(`${FAKE_DIR}/models`))],
				['green', __(messages.DIR_CREATED, tildify(`${FAKE_DIR}/migrations`))],
			];
			const messagesForFreshSetup_verbose = messagesForFreshSetup.concat([
				['blue', messages.ENSURING_DIRS],
				['blue',  __(messages.CREATING_DIR, tildify(`${FAKE_DIR}/models`))],
				['blue',  __(messages.CREATING_DIR, tildify(`${FAKE_DIR}/migrations`))]
			]);

			// Run the function in normal mode (not verbose)
			return schema.init().then(() => {
				// Make sure file and dirs have been created!
				['models', 'migrations', 'danafile.js'].forEach(item => {
					let path = dana.config('baseDir') + '/' + item;
					expect(fs.pathExistsSync(path)).to.be(true);
					// Remove the created file/directory for next test!
					fs.removeSync(path);
				});
				// Make sure correct messages have been logged!
				expect(log.echo.getCalls().length).to.eql(
					messagesForFreshSetup.length
				);
				messagesForFreshSetup.forEach(log_item => {
					expect(log.echo.withArgs(...log_item).calledOnce).to.be(true);
				});

				// Reset history of spy calles for next test!
				log.echo.resetHistory();

				// recheck the function in `verbose` mode
				return schema.init(true).then(() => {
					['models', 'migrations', 'danafile.js'].forEach(item => {
						let path = FAKE_DIR + '/' + item;
						expect(fs.pathExistsSync(path)).to.be(true);
					});
					expect(log.echo.getCalls().length).to.eql(6);
					messagesForFreshSetup_verbose.forEach(log_item => {
						expect(log.echo.withArgs(...log_item).calledOnce).to.be(true);
					});
				});
			});
		});

		it('should just log when danafile.js and required directories exist!', function() {
			const dana = mocker.mockDana(FAKE_DIR);
			const schema = new Schema(dana);
			const messagesForDirtySetup = [
				['yellow', __(messages.CONFIG_FILE_EXISTS, tildify(`${FAKE_DIR}/danafile.js`))],
				['yellow', __(messages.DIR_EXISTS, tildify(`${FAKE_DIR}/migrations`))],
				['yellow', __(messages.DIR_EXISTS, tildify(`${FAKE_DIR}/models`))],
			];
			const messagesForDirtySetup_verbose = messagesForDirtySetup.concat([
				['blue', messages.ENSURING_DIRS]
			]);
			// Reset history of spy calles for next test!
			log.echo.resetHistory();

			return schema.init(false).then(() => {
				expect(log.echo.getCalls().length).to.eql(3);
				messagesForDirtySetup.forEach(log_item => {
					expect(log.echo.withArgs(...log_item).calledOnce).to.be(true);
				});
				// Reset history of spy calles for next test!
				log.echo.resetHistory();
				// make sure the method works correctly in verbose mode
				return schema.init(true).then(() => {
					expect(log.echo.getCalls().length).to.eql(4);
					messagesForDirtySetup_verbose.forEach(log_item => {
						expect(log.echo.withArgs(...log_item).calledOnce).to.be(true);
					});
				});
			});
		});
	});

	describe('.getModels()', function() {
		const schema = new Schema(mocker.mockDana(FAKE_DIR));

		before(function() {
			// prepare/mock model files for testing!
			mocker.mockFs({
				[`${FAKE_DIR}/models`]: {
					'one.js': Schema.defineBaseModel('one'),
					'two.js': Schema.defineBaseModel('two'),
					'three.js': Schema.defineBaseModel('three')
				}
			});
		});

		after(function() {
			mocker.unMockFs();
		});

		it('should get the model files properly', function() {
			return schema.getModels().then(collection => {
				expect(collection).to.only.have.keys(['parsed', 'original']);
				expect(collection.parsed.length).to.eql(3);
				const tableNames = _.map(collection.parsed, 'tableName');
				expect(tableNames).to.eql( ['one', 'three', 'two'] );
			});
		});

		it('.getModelTableNames() should work properly with valid models', function() {
			return schema.getModelTableNames().then(collection => {
				expect(collection).to.eql([{
					filename: 'one',
					tableName: 'one'
				}, {
					filename: 'three',
					tableName: 'three'
				}, {
					filename: 'two',
					tableName: 'two'
				}]);
			});
		});

	});

	describe('.getModelTableNames() - post test', function() {
		const schema = new Schema(mocker.mockDana(FAKE_DIR));
		const messagesForInvalidSetup = [
			['yellow', __(messages.INVALID_MODEL_EXPORTED_CONTENT, tildify(`${FAKE_DIR}/models/two.js`), 'date') ],
			['yellow', __(messages.MODEL_NAME_NOT_EQUAL_TO_TABLENAME, tildify(`${FAKE_DIR}/models/z.js`), 'x') ]
		];

		before(function() {
			mocker.mockLogger();
			// prepare/mock model files for testing!
			mocker.mockFs({
				[`${FAKE_DIR}/models`]: {
					'one.js': Schema.defineBaseModel('one'),
					'two.js': 'module.exports = new Date',
					'z.js': Schema.defineBaseModel('x')
				}
			});
		});

		after(function() {
			mocker.unmockLogger();
			mocker.unMockFs();
		});

		it('should get the table names properly and warn user for invalid models', function() {
			return schema.getModelTableNames(true).then(tableNames => {
				expect(tableNames.length).to.eql(3);
				expect(log.echo.getCalls().length).to.eql(2);
				messagesForInvalidSetup.forEach(log_item => {
					expect(log.echo.withArgs(...log_item).calledOnce).to.be(true);
				});
			});
		});
	});

	describe('.createModels()', function() {
		const schema = new Schema(mocker.mockDana(FAKE_DIR));
		const validTables = ['one', 'two'];
		before(function() {
			mocker.mockLogger();
			// prepare/mock model files for testing!
			mocker.mockFs({
				[`${FAKE_DIR}/models`]: {
					'model_filename.js': Schema.defineBaseModel('different_tablename')
				}
			});
		});

		after(function() {
			mocker.unmockLogger();
			mocker.unMockFs();
		});

		it('should create new models properly', function() {
			return schema.createModels(validTables, true).then(models => {
				expect(models.length).to.eql(validTables.length);
				expect(models[0]).to.eql({
					tableName: 'one',
					path: `${FAKE_DIR}/models/one.js`,
				});
				// create another model in normal mode
				return schema.createModels(['three'], false);
			});
		});

		it('should fail for duplicate table names', function() {
			const tableNames = ['five', 'one', 'three', 'four', 'two'];
			return schema.createModels(tableNames, true).then((duplicates) => {
				expect(duplicates).to.eql(['one', 'three', 'two']);
			});
		});

		it('should fail for invalid table names', function() {
			const tableNames = ['this_should_be_valid', 'This is invalid', 'Invalid2'];
			const logItem = [
				'red', __(
					messages.INAVLID_TABLE_NAMES,
					log.listify(tableNames.slice(1)),
					Table.getNameRegex()
				), true
			];
			log.echo.resetHistory();
			return schema.createModels(tableNames, true).then(invalids => {
				expect(invalids.length).to.eql(2);
				expect(log.echo.getCalls().length).to.eql(1);
				expect(log.echo.withArgs(...logItem).calledOnce).to.be(true);
			});
		});

		it('should fail for models that have similar file name (equal to desired table name) and different tableName (which passes dupliacate tableName checks)', function() {
			return schema.createModels(['model_filename', 'valid']).then((invalids) => {
				expect(invalids).to.eql(['model_filename']);
			});
		});
	});
});
