const helpers = require('../../../src/lib/helpers')
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
				'/home/user/dir/another_file.yaml'
			];
			const output = [{
				name: 'filename',
				ext: 'js',
				path: '/home/user/filename.js',
				src: undefined
			}, {
				name: 'another_file',
				ext: 'yaml',
				path: '/home/user/dir/another_file.yaml',
				src: undefined
			}];
			const returned = helpers.normalizeFiles(input, false);
			expect(returned).to.eql(output);
		});
	});

});
