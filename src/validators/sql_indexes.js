const
	_             = require('lodash')
	, { getType } = require('../lib/helpers')
	, datatypes    = require('../datatypes')
	, assign = Object.assign;

const
	validIndexTypes = ['index', 'unique', 'fulltext']
	, fullTextTypes = ['char', 'varchar', 'text']
	, indexRequiredLengthTypes = [
		'blob', 'tinyblob', 'mediumblob', 'longblob',
		'text', 'tinytext', 'mediumtext', 'longtext'
	]
	, indexColRegex = /^([a-z]([_]?[a-z]+))*(\(\d+\))?$/
	, indexColNameRegex = /^([a-z]*_?[a-z]*)*/
	, indexColLengthRegex = /\((\d+)\)$/;

const errors = {
	'NOT_ARRAY': '"index" property must be an array of object(s)!',
	'NOT_OBJECT': 'An index must be defined as an object!',
	'COLUMNS_NOT_ARRAY': '"columns" property of an index must be an array!',
	'INVALID_INDEX_TYPE': `Invalid index type. "type" property must one of these values: ${validIndexTypes.join(', ')}`,
	'INVALID_INDEX_COLUMN_NAME': `Invalid index column name! The column should match "${indexColRegex}".`,
	'EMPTY_COLUMNS': 'No column names specified for creating the index!',
	'DUPLICATE_COLUMN': 'Index has duplicate columns!',
	'COLUMN_DOES_NOT_EXIST': 'Column specified for indexing doesn\'t exist!',
	'BLOB_TEXT_MISSING_PREFIX': '"When you index a BLOB or TEXT column, you must specify a prefix length for the index." source: https://dev.mysql.com/doc/refman/5.7/en/column-indexes.html',
	'FULLTEXT_UNSUPPORTED_TYPE': '"FULLTEXT indexes are ... only for CHAR, VARCHAR, and TEXT columns." source: https://dev.mysql.com/doc/refman/5.7/en/column-indexes.html',
};

module.exports = {
	name: 'sql_index',
	description: 'Element must be a valid array of indexes!',
	valids: [
		undefined,
		{
			value: [{
				type: 'index',
				columns: ['foo', 'bar']
			}, {
				type: 'fulltext',
				columns: ['foo'],
			}, {
				type: 'index',
				columns: ['baz(26)']
			}],
			attributes: {
				schema: {
					columns: {
						foo: assign({}, datatypes.varchar),
						bar: assign({}, datatypes.char),
						baz: 'text',
					}
				}
			}
		}
	],
	invalids: [
		{
			message: errors.NOT_ARRAY,
			value: {},
			attributes: { schema: { columns: {} } }
		},
		{
			message: errors.NOT_OBJECT,
			value: [null],
			attributes: { schema: { columns: {} } }
		},
		{
			message: errors.COLUMNS_NOT_ARRAY,
			value: [{
				type: 'index',
				columns: {}
			}],
			attributes: { schema: { columns: {} } }
		},
		{
			message: errors.INVALID_INDEX_TYPE,
			value: [{
				type: 'unknown',
				columns: ['foo'],
			}],
			attributes: { schema: { columns: {} } }
		},
		{
			message: errors.EMPTY_COLUMNS,
			value: [{
				type: 'index',
				columns: []
			}],
			attributes: { schema: { columns: {} } }
		},
		{
			message: errors.INVALID_INDEX_COLUMN_NAME,
			value: [{
				type: 'index',
				columns: ['foo__7']
			}],
			attributes: { schema: { columns: {} } }
		},
		{
			message: errors.DUPLICATE_COLUMN,
			value: [{
				type: 'index',
				columns: ['foo', 'foo']
			}],
			attributes: { schema: { columns: {} } }
		},
		{
			message: errors.COLUMN_DOES_NOT_EXIST,
			value: [{
				type: 'index',
				columns: ['foo']
			}],
			attributes: { schema: { columns: {} } }
		},
		{
			message: errors.BLOB_TEXT_MISSING_PREFIX,
			value: [{
				type: 'index',
				columns: ['column_name']
			}],
			attributes: {
				schema: {
					columns: {
						column_name: { type: 'text' }
					}
				}
			}
		},
		{
			message: errors.FULLTEXT_UNSUPPORTED_TYPE,
			value: [{
				type: 'fulltext',
				columns: ['col_name']
			}],
			attributes: {
				schema: {
					columns: {
						col_name: 'int'
					}
				}
			}
		}
	],
	handler(value, options, key, message, attributes) {
		const type = getType(value);
		if (type === 'undefined') return;
		if (type !== 'array') {
			return errors.NOT_ARRAY;
		}
		const columns = Object.keys(attributes.schema.columns);
		for ( var i = 0, l = value.length; i < l; i++ ) {
			let index = value[i];
			if ( getType(index) !== 'object' ) {
				return errors.NOT_OBJECT;
			}

			if ( getType(index.columns) !== 'array' ) {
				return errors.COLUMNS_NOT_ARRAY;
			}

			if ( !validIndexTypes.includes(index.type) ) {
				return errors.INVALID_INDEX_TYPE;
			}

			if ( index.columns.length === 0 ) {
				return errors.EMPTY_COLUMNS;
			}

			for ( var j = 0, ll = index.columns.length; j < ll; j++ ) {
				let indexCol = index.columns[j];
				if ( !indexColRegex.test(indexCol) ) {
					return errors.INVALID_INDEX_COLUMN_NAME;
				}
				let isDuplicate = _.includes(index.columns, indexCol, j + 1);
				let colLength = (indexCol.match(indexColLengthRegex) || [])[1];
				let colName = indexCol.match(indexColNameRegex)[0];
				if (isDuplicate) {
					return errors.DUPLICATE_COLUMN;
				}
				if ( columns.indexOf(colName) === -1 ) {
					return errors.COLUMN_DOES_NOT_EXIST;
				}
				let targetCol = attributes.schema.columns[colName];
				let targetColType = getType(targetCol) === 'object' ? targetCol.type : targetCol;
				if ( targetColType && indexRequiredLengthTypes.includes(targetColType) && !colLength ) {
					return errors.BLOB_TEXT_MISSING_PREFIX;
				}
				if ( index.type === 'fulltext' ) {
					if ( targetColType && !fullTextTypes.includes(targetColType) ) {
						return errors.FULLTEXT_UNSUPPORTED_TYPE;
					}
				}
			}
		}
	}
};
