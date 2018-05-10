const Table = require('../../../src/lib/Table.js')
	, datatypes = require('../../../src/datatypes')
	, expect = require('expect.js');

describe('lib/Table', function() {
	describe('normalizers:', function() {
		const input = {
			tableName: 'table_name',
			schema: {
				columns: {
					'varchar_column_a': 'varchar',
					'varchar_column_b': { type: 'varchar' },
					'varchar_column_c': { type: 'varchar', nullable: false, comment: 'a comment' }
				}
			}
		};
		const output = {
			tableName: 'table_name',
			schema: {
				columns: {
					'varchar_column_a': Object.assign({}, datatypes.varchar.defaults),
					'varchar_column_b': Object.assign({}, datatypes.varchar.defaults),
					'varchar_column_c': Object.assign({}, datatypes.varchar.defaults, { type: 'varchar', nullable: false, comment: 'a comment' })
				}
			}
		};
		describe('static.normalizeSpec()', function() {
			it('should normalize properly', function() {
				expect( Table.normalizeSpec(input) ).to.eql( output );
			});
		});
		describe('static.normalizeSpecs()', function() {
			it('should normalize properly', function() {
				expect( Table.normalizeSpecs([input]) ).to.eql( [output] );
			});
		});
	});

	const exampleValidModelFile = {
		filename: 'model_name',
		path: '/directory/model_name.js',
		ext: 'js',
		src: {
			tableName: 'table_name',
			schema: {
				columns: {
					'varchar_column': 'varchar',
					'char_column': { type: 'char' },
					'date_column': 'date',
					'int_column': 'int'
				},
				charset: 'utf32',
				collation: 'utf32_unicode_ci'
			},
			_fid: 'aaa'
		}
	};

	it('should create an instance properly', function() {
		const table = new Table(exampleValidModelFile);
		expect(table.getName()).to.be('table_name');
		// The columns isn't yet parsed!
		expect(table.getColumns()).to.eql(exampleValidModelFile.src.schema.columns);
		expect(table.originalSpec).to.be(exampleValidModelFile.src);
	});

	it('should parse the spec properly', function() {
		const table = new Table(exampleValidModelFile);
		return table.parse().then(spec => {
			expect(spec).to.be(table.spec);
			expect(spec.schema.columns).to.eql({
				'varchar_column': Object.assign({}, datatypes.varchar.defaults),
				'char_column': Object.assign({}, datatypes.char.defaults),
				'date_column': Object.assign({}, datatypes.date.defaults),
				'int_column': Object.assign({}, datatypes.int.defaults)
			});
		});
	});

	it('should extend the model charset and collation properly', function() {
		const model = Object.assign({}, exampleValidModelFile);
		model.src.schema.charset = undefined;
		model.src.schema.collation = undefined;
		const table = new Table(exampleValidModelFile);
		return table.parse().then(spec => {
			expect(spec).to.be(table.spec);
			expect(spec.schema.charset).to.eql(table.defaultCharset);
			expect(spec.schema.collation).to.eql(table.defaultCollation);
		});
	});

	function shouldNotPass() {
		throw new Error('The test should not pass!');
	}

	it('should fail for invalid schema', function() {
		const table = new Table({
			filename: 'model_name',
			path: '/directory/model_name.js',
			src: {
				tableName: 'inValid-Name',
				schema: {
					columns: {
						'invalid_type': 'biz',
						'valid_item': { type: 'varchar' },
						'invalid_charset': { type: 'varchar', charset: '...' },
						'invalidName': { type: 'datetime' },
						'another_valid_item': 'timestamp',
					},
					charset: 'utf32', // valid charset
					collation: 'ehm!'
				},
				_fid: 'aaa'
			},
		});
		return table.parse().then(shouldNotPass).catch(e => {
			const errors = e.errors;
			// should only have errors for invalid keys
			expect(errors).to.only.have.keys([
				'tableName', 'schema.columns', 'schema.collation'
			]);
			expect( errors['schema.columns'] ).to.have.length(1);
			expect( errors['schema.columns'][0] ).to.only.have.keys([
				'invalid_type', 'invalid_charset', 'invalidName'
			]);
		});
	});


});
