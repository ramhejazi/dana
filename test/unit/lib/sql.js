const sql = require('../../../src/lib/sql.js')
	, datatypes = require('../../../src/datatypes')
	, expect = require('expect.js');

describe('lib/sql', function() {
	describe('.createTable()', function() {
		it('should generate valid SQL for creating a table', function() {
			const model = {
				tableName: 'foo',
				schema: {
					columns: {
						'varchar_field': {
							type: 'varchar',
							nullable: false,
							default: 'default value',
							charset: 'utf32',
							collate: 'utf32_unicode_520_ci'
						}
					}
				}
			};
			const tableSQL = sql.createTable(model);
			expect(tableSQL).to.eql([
				'CREATE TABLE `foo` (',
				'  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,',
				'  `varchar_field` ' + datatypes.varchar.generateSQL(model.schema.columns.varchar_field) + ',',
				'  PRIMARY KEY (`id`)',
				') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;'
			]);
		});
	});
	
	describe('.getColumnSQL()', function() {
		it('should throw error for nonexistent datatypes', function() {
			expect(sql.getColumnSQL).withArgs('nonexistent').to.throwError();
		});
	});
});
