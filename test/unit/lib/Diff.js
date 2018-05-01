const Diff = require('../../../src/lib/Diff')
	, expect = require('expect.js')
	, sql = require('../../../src/lib/sql.js');

describe('lib/Diff', function() {

	it('must succeed when creating an instance', function() {
		const diff = new Diff([], []);
		expect(diff).to.have.keys([
			'oTables', 'nTables', '_oIds', '_nIds',
			'_newIds', '_droppedTables', '_createdTables',
			'_logs', 'up', 'dn'
		]);
		expect(diff.hasChanged()).to.be(false);
		expect(diff.getLogs()).to.be.empty();
		expect(diff.getMigrationData()).to.eql({
			up: '',
			down: ''
		});
		expect(diff._logs).to.be.empty();
		diff._log('log_type', 'log message!');
		expect(diff._logs).to.eql([{
			type: 'log_type',
			message: 'log message!'
		}]);
	});

	/**
	 * Creating some tests dynamically!
	 * Each property of the `testData` variable refers to a method of Diff instance
	 * and it's values are it's parameters.
	 * Since each method calls a correponsing method of `sql` module and doesn't
	 * do anything complicated, writing tests this way has some benefits:
	 * - Easier for maintenance
	 * - More stable/coherent tests
	 */
	const sampleModel = {
		tableName: 'table_name',
		schema: {
			columns: {
				column_name: {
					type: 'varchar',
					length: 255,
					default: undefined,
					nullable: true,
					collate: undefined,
					charset: undefined,
					comment: undefined
				}
			},
			indexes: [{
				type: 'index',
				columns: ['column_name']
			}],
			charset: 'utf8mb4',
			collation: 'utf8mb4_unicode_ci'
		},
		_fid: 'im_unique'
	};

	const testData = {
		'_createTable': { m: ['up', sampleModel], s: [sampleModel] },
		'_dropTable':   { m: ['up', sampleModel], s: ['table_name'] },
		'_addColumn':   {
			m: ['up', 'table_name', 'column_name', sampleModel.schema.columns['column_name']],
			s: ['table_name', 'column_name', sql.getColumnSQL(sampleModel.schema.columns['column_name'])]
		},
		'_alterColumn': {
			m: ['up', 'table_name', 'column_name', sampleModel.schema.columns['column_name']],
			s: ['table_name', 'column_name', 'column_name', sql.getColumnSQL(sampleModel.schema.columns['column_name'])]
		},
		'_dropColumn': { m: ['up', 'table_name', 'column_name'], s: ['table_name', 'column_name']},
		'_renameTable': { m: ['up', 'table_name', 'new_table_name'], s: ['table_name', 'new_table_name']},
		'_createIndex': {
			m: ['up', 'table_name', sampleModel.schema.indexes[0]],
			s: ['table_name', sampleModel.schema.indexes[0]]
		},
		'_dropIndex': {
			m: ['up', 'table_name', sampleModel.schema.indexes[0]],
			s: ['table_name', sampleModel.schema.indexes[0]]
		},
		'_changeTableCharset': {
			m: ['up', 'table_name', sampleModel.schema.charset, sampleModel.schema.collation],
			s: ['table_name', sampleModel.schema.charset, sampleModel.schema.collation]
		}
	};

	Object.keys(testData).forEach(function(methodName) {
		const sqlMethod = methodName.slice(1);
		const args = testData[methodName]['m'];
		const sqlArgs = testData[methodName]['s'];
		it(`${methodName}() should work property`, function() {
			const diffInstance = new Diff([], []);
			const sqlResult = [].concat(sql[sqlMethod](...sqlArgs));
			diffInstance[methodName](...args);
			expect(diffInstance.up).to.eql(sqlResult);
		});
	});

	it('must detect a table and generate correct SQL', function() {
		const oTables = [];
		const nTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					column_name: { type: 'varchar' }
				},
				indexes: [{
					type: 'index',
					columns: ['column_name']
				}]
			},
		}];

		const diff = new Diff(oTables, nTables);
		const expectedUp = sql.createTable(nTables[0]).concat(sql.createIndex('a_table', nTables[0].schema.indexes[0]));
		const expectedDown = [sql.dropTable(nTables[0].tableName)];
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
	});

	it('must detect the new model/table correctly', function() {
		const oTables = [{
			tableName: 'a_table',
			schema: { columns: {} },
			_fid: 'aaaaaa'
		}];
		const nTables = [{
			tableName: 'a_table',
			schema: { columns: {} },
			_fid: 'aaaaaa'
		}, {
			tableName: 'b_table',
			schema: { columns: {} },
			_fid: 'bbbbbb'
		}];
		const diff = new Diff(oTables, nTables);
		const expectedUp = sql.createTable(nTables[1]);
		const expectedDown = [sql.dropTable(nTables[1].tableName)];
		// `diff.up` should be eql to result of calling sql.createTable(nTables[1])
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
	});

	it('must rename tables correctly', function() {
		const oTables = [{
			tableName: 'a_table',
			schema: { columns: {} },
			_fid: 'aaaaaa'
		}];
		const nTables = [{
			tableName: 'new_table',
			schema: { columns: {} },
			_fid: 'aaaaaa'
		}];
		const diff = new Diff(oTables, nTables);
		const expectedUp = [sql.renameTable(oTables[0].tableName, nTables[0].tableName)];
		const expectedDown = [sql.renameTable(nTables[0].tableName, oTables[0].tableName)];
		// `diff.up` should be eql to result of calling sql.createTable(nTables[1])
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
	});

	it('must detect table charset/collation altering', function() {
		const oTables = [{
			tableName: 'a_table',
			schema: {
				columns: {},
				charset: 'utf8mb4',
				collation: 'utf8mb4_unicode_ci'
			},
			_fid: 'aaaaaa'
		}];
		const nTables = [{
			tableName: 'a_table',
			schema: {
				columns: {},
				charset: 'utf8mb4',
				collation: 'utf8mb4_roman_ci'
			},
			_fid: 'aaaaaa'
		}];
		const diff = new Diff(oTables, nTables);
		const expectedUp = [sql.changeTableCharset('a_table', 'utf8mb4', 'utf8mb4_roman_ci')];
		const expectedDown = [sql.changeTableCharset('a_table', 'utf8mb4', 'utf8mb4_unicode_ci')];
		// `diff.up` should be eql to result of calling sql.createTable(nTables[1])
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
	});

	it('must detect model/table removal correctly', function() {
		const oTables = [{
			tableName: 'a_table',
			schema: { columns: {} },
			_fid: 'aaaaaa'
		}, {
			tableName: 'b_table',
			schema: { columns: {} },
			_fid: 'bbbbbb'
		}];
		const nTables = [{
			tableName: 'a_table',
			schema: { columns: {} },
			_fid: 'aaaaaa'
		}];
		const diff = new Diff(oTables, nTables);
		const expectedUp = [sql.dropTable(oTables[1].tableName)];
		const expectedDown = sql.createTable(oTables[1]);
		// `diff.up` should be eql to result of calling sql.createTable(nTables[1])
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
	});

	it('must detect the new columns correctly', function() {
		const oTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					'column_name': { type: 'varchar' }
				}
			},
			_fid: 'aaaaaa'
		}];
		const nTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					'column_name': { type: 'varchar' },
					'new_column': { type: 'varchar' }
				}
			},
			_fid: 'aaaaaa'
		}];
		const diff = new Diff(oTables, nTables);
		const columnSQL = sql.getColumnSQL(nTables[0].schema.columns.new_column);
		const expectedUp = [sql.addColumn('a_table', 'new_column', columnSQL)];
		const expectedDown = [sql.dropColumn('a_table', 'new_column')];
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
	});

	it('must detect column removal correctly', function() {
		const oTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					'column_name': { type: 'varchar' },
					'new_column': { type: 'varchar' }
				}
			},
			_fid: 'aaaaaa'
		}];
		const nTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					'column_name': { type: 'varchar' }
				}
			},
			_fid: 'aaaaaa'
		}];
		const diff = new Diff(oTables, nTables);
		const columnSQL = sql.getColumnSQL(oTables[0].schema.columns.new_column);
		const expectedUp = [sql.dropColumn('a_table', 'new_column')];
		const expectedDown = [sql.addColumn('a_table', 'new_column', columnSQL)];
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
	});

	it('must detect column altering correctly', function() {
		const oTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					// Make sure we have similar properties as Diff class expects
					// normalized specs
					'column_name': { type: 'varchar', length: 255, comment: undefined }
				}
			},
			_fid: 'aaaaaa'
		}];
		const nTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					'column_name': { type: 'varchar', length: 255, comment: 'this is a comment!' }
				}
			},
			_fid: 'aaaaaa'
		}];
		const diff = new Diff(oTables, nTables);
		const oColumnSQL = sql.getColumnSQL(oTables[0].schema.columns.column_name);
		const nColumnSQL = sql.getColumnSQL(nTables[0].schema.columns.column_name);
		const expectedUp = [sql.alterColumn('a_table', 'column_name', 'column_name', nColumnSQL)];
		const expectedDown = [sql.alterColumn('a_table', 'column_name', 'column_name', oColumnSQL)];
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
	});

	it('must detect new indexes correctly', function() {
		const oTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					column_name: { type: 'varchar' }
				}
			},
			_fid: 'aaaaaa'
		}];
		const nTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					column_name: { type: 'varchar' }
				},
				indexes: [{
					type: 'index',
					columns: ['column_name']
				}]
			},
			_fid: 'aaaaaa'
		}];
		const diff = new Diff(oTables, nTables);
		const diff2 = new Diff([], []);
		const diff3 = new Diff([], []);
		const expectedUp = [sql.createIndex('a_table', nTables[0].schema.indexes[0])];
		const expectedDown = [sql.dropIndex('a_table', nTables[0].schema.indexes[0])];
		diff2._diffTableIndexes(oTables[0], nTables[0]);
		diff3._diffTables(oTables[0], nTables[0]);
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
		expect(diff2.up).to.eql(expectedUp);
		expect(diff2.dn).to.eql(expectedDown);
		expect(diff3.up).to.eql(expectedUp);
		expect(diff3.dn).to.eql(expectedDown);
	});

	it('must detect removing indexes correctly', function() {
		const oTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					column_name: { type: 'varchar' }
				},
				indexes: [{
					type: 'index',
					columns: ['column_name']
				}]
			},
			_fid: 'aaaaaa'
		}];
		const nTables = [{
			tableName: 'a_table',
			schema: {
				columns: {
					column_name: { type: 'varchar' }
				}
			},
			_fid: 'aaaaaa'
		}];
		const diff = new Diff(oTables, nTables);
		const diff2 = new Diff([], []);
		const diff3 = new Diff([], []);
		const expectedUp = [sql.dropIndex('a_table', oTables[0].schema.indexes[0])];
		const expectedDown = [sql.createIndex('a_table', oTables[0].schema.indexes[0])];
		diff2._diffTableIndexes(oTables[0], nTables[0]);
		diff3._diffTables(oTables[0], nTables[0]);
		expect(diff.up).to.eql(expectedUp);
		expect(diff.dn).to.eql(expectedDown);
		expect(diff2.up).to.eql(expectedUp);
		expect(diff2.dn).to.eql(expectedDown);
		expect(diff3.up).to.eql(expectedUp);
		expect(diff3.dn).to.eql(expectedDown);
	});


});
