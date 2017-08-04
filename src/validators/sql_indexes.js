const {
	getType
} = require('../lib/helpers');

const _ = require('lodash');
const validIndexTypes = ['index', 'unique', 'fulltext'];
const fullTextTypes = ['char', 'varchar', 'text'];
const indexRequiredLengthTypes = ['blob', 'tinyblob', 'mediumblob', 'longblob', 'text', 'tinytext', 'mediumtext', 'longtext'];
const indexColRegex = /^([a-z]([_]?[a-z]+))*(\(\d+\))?$/;
const indexColNameRegex = /^([a-z]([_]?[a-z]+))*/;
const indexColLengthRegex = /\((\d+)\)$/;
const datatypes = require('../datatypes');
const assign = Object.assign;

const notes = {
	'blob_text_missing_prefix': `
		"When you index a BLOB or TEXT column, you must specify a prefix length for the index."
		source: https://dev.mysql.com/doc/refman/5.7/en/column-indexes.html
	`,
	'fulltext_unsupported_type': `
		"FULLTEXT indexes are ... only for CHAR, VARCHAR, and TEXT columns."
		source: https://dev.mysql.com/doc/refman/5.7/en/column-indexes.html
	`
};

module.exports = {
	name: 'sql_index',
	description: 'Element must be a valid array of index objects!',
	v: [
		{
			value: [{
				type: 'index',
				columns: ['foo', 'bar']
			}, {
				type: 'fulltext',
				columns: ['foo']
			}],
			attributes: {
				columns: {
					foo: assign({}, datatypes.varchar),
					bar: assign({}, datatypes.char),
				}
			}
		}
	],
	i: [
		{
			value: [{
				type: 'index',
				columns: ['doesnotexist']
			}, {
				type: 'fulltext',
				columns: ['baz']
			}],
			attributes: {
				columns: {
					baz: assign({}, datatypes.int),
					foo: assign({}, datatypes.varchar),
					bar: assign({}, datatypes.char),
				}
			}
		}
	],
	handler(value, options, key, message, attributes) {
		const type = getType(value);
		if (type === 'undefined') return;
		if (type !== 'array') {
			return '"index" property must be an array of object(s)!';
		}
		const columns = Object.keys(attributes.schema.columns);
		for ( var i = 0, l = value.length; i < l; i++ ) {
			let index = value[i];
			if ( getType(index) !== 'object' ) {
				return 'An index must be defined as an object!';
			}

			if ( getType(index.columns) !== 'array' ) {
				return '"columns" property of an index must be an array!';
			}

			if ( !validIndexTypes.includes(index.type) ) {
				return `Invalid index type. "type" property must one of these values: ${validIndexTypes.join(', ')}`;
			}

			for ( var j = 0, ll = index.columns.length; j < ll; j++ ) {
				let indexCol = index.columns[j];
				if ( !indexColRegex.test(indexCol) ) {
					return `Invalid index column name: "${indexCol}"! The column should match "${indexColNameRegex}".`;
				}
				let isDuplicate = _.includes(index.columns, indexCol, j + 1);
				let colLength = (indexCol.match(indexColLengthRegex) || [])[1];
				let colName = (indexCol.match(indexColNameRegex) || [])[1];
				if (isDuplicate) {
					return `Index has duplicate column: "${indexCol}"`;
				}
				if ( !columns.includes(colName) ) {
					return `Column specficied for indexing doesn't exist: "${indexCol}"`;
				}
				let targetCol = columns[colName];
				let targetColType = getType(targetCol) === 'object' ? targetCol.type : targetCol;
				if ( targetColType && indexRequiredLengthTypes.includes(targetColType) && !colLength ) {
					return notes.fulltext_missing_length_notice;
				}
				if ( index.type === 'fulltext' ) {
					if ( targetColType && !fullTextTypes.includes(targetColType) ) {
						return notes.fulltext_unsupported_type;
					}
				}
			}
		}
	}
};