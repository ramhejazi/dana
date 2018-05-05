/*global after, before*/

const helpers = require('../../../src/lib/helpers')
	, mockFs = require('mock-fs')
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

	describe('.normalizeFiles()', function() {
		it('should convert each passed array element into an object', function() {
			const input = [
				'/home/user/filename.js',
				'/home/user/dir/another_file.yml'
			];
			const output = [{
				name: 'filename',
				ext: 'js',
				path: '/home/user/filename.js',
				src: undefined
			}, {
				name: 'another_file',
				ext: 'yml',
				path: '/home/user/dir/another_file.yml',
				src: undefined
			}];
			const returned = helpers.normalizeFiles(input, false);
			expect(returned).to.eql(output);
		});
	});

	describe('.requireDirFiles()', function() {
		before(function() {
			mockFs({
				'/test_directory': {
					'js_file.js': 'module.exports="js file content"',
					'js_file2.js': 'module.exports="second js file content"'
				}
			});
		});

		after(function() {
			mockFs.restore();
		});

		it('should read dir files correctly', function() {
			return helpers.requireDirFiles('/test_directory/*', false).then(function(normalizedFiles) {
				expect(normalizedFiles).to.eql([
					{
						name: 'js_file',
						ext: 'js',
						path: '/test_directory/js_file.js',
						src: undefined
					},
					{
						name: 'js_file2',
						ext: 'js',
						path: '/test_directory/js_file2.js',
						src: undefined
					}
				]);
			});
		});
	});

	describe('.readYamlFile()', function() {
		before(function() {
			mockFs({
				'/test_directory': {
					'yaml_file.yml': 'up: Up property value!'
				}
			});
		});

		after(function() {
			mockFs.restore();
		});

		it('should read and load the file correctly', function() {
			return helpers.readYamlFile('/test_directory/yaml_file.yml').then(function(content) {
				expect(content).to.eql({ up: 'Up property value!'});
			});
		});
	});
});
