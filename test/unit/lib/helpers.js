/*global after, before*/

const helpers = require('../../../src/lib/helpers')
	, mocker = require('../_mocker')
	, expect = require('expect.js');

describe('lib/helpers', function() {

	describe('.createDateStr()', function() {
		it('should generate a currect date string', function() {
			const date_string = helpers.createDateStr();
			expect(date_string).to.have.length(19);
		});
	});

	describe('.createMigrationFileName()', function() {
		it('should generate a valid migration file name', function() {
			const migration_file_name = helpers.createMigrationFileName();
			const date_string = helpers.createDateStr();
			expect(date_string).to.have.length(migration_file_name.length);
		});
	});

	describe('.getType()', function() {
		it('should detect type of datum correctly', function() {
			const testData = {
				'string': ['value'],
				'array': [['value'], new Array()],
				'number': [1, Infinity, -1, new Number()],
				'date': [new Date()],
				'object': [{ key: 'value' }, new Object()],
				'boolean': [true, false, new Boolean(1)],
				'undefined': [undefined, ],
				'null': [null]
			};
			const types = Object.keys(testData);
			types.forEach(function(type) {
				const values = testData[type];
				values.forEach(function(value) {
					expect(helpers.getType(value)).to.be(type);
				});
			});
		});
	});

	describe('.requireDirFiles()', function() {
		before(function() {
			mocker.mockFs({
				'/test_directory': {
					'js_file.js': 'module.exports="js file content"',
					'js_file2.js': 'module.exports="second js file content"'
				}
			});
		});

		after(function() {
			mocker.unMockFs();
		});

		it('should read dir files correctly', function() {
			return helpers.requireDirFiles('/test_directory/*', true).then(function(normalizedFiles) {
				expect(normalizedFiles).to.eql([
					{
						name: 'js_file',
						ext: 'js',
						path: '/test_directory/js_file.js',
						src: 'js file content'
					},
					{
						name: 'js_file2',
						ext: 'js',
						path: '/test_directory/js_file2.js',
						src: 'second js file content'
					}
				]);
			});
		});
	});

	describe('.readYamlFile()', function() {
		before(function() {
			mocker.mockFs({
				'/test_directory': {
					'yaml_file.yml': 'up: Up property value!'
				}
			});
		});

		after(function() {
			mocker.unMockFs();
		});

		it('should read and load the file correctly', function() {
			return helpers.readYamlFile('/test_directory/yaml_file.yml').then(function(content) {
				expect(content).to.eql({ up: 'Up property value!'});
			});
		});
	});

	describe('.normalizeFiles()', function() {
		before(function() {
			mocker.mockFs({
				'/home/user': {
					'filename.js': 'module.exports = "test"',
					'another_file.js': 'module.exports = { "foo": 2 }'
				}
			});
		});
		after(function() {
			mocker.unMockFs();
		});

		it('should convert each passed array element into an object', function() {
			const input = [
				'/home/user/filename.js',
				'/home/user/another_file.js'
			];
			const output = [{
				name: 'filename',
				ext: 'js',
				path: '/home/user/filename.js',
				src: 'test'
			}, {
				name: 'another_file',
				ext: 'js',
				path: '/home/user/another_file.js',
				src: { foo: 2 }
			}];
			const returned = helpers.normalizeFiles(input);
			expect(returned).to.eql(output);
		});
	});
});
