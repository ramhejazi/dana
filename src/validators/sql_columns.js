const
	datatypes = require('../datatypes')
	, mitra = require('mitra')
	, _ = require('lodash')
	, helpers = require('../lib/helpers')
	, Promise = require('bluebird')
	, nameRegex = /^[a-z]([_]?[a-z]+)*$/;

const errors = {
	'REDUNDANT_ID': 'column name "id" is preserved! dana automatically creates an "id" column for each table!',
	'INVALID_COLUMN_NAME': `invalid column name! column name must be a string matching "${nameRegex}" regular expression!`,
	'INAVLID_COLUMN_SPEC_TYPE': 'invalid datatype definition. columns must have either a string or an object value!',
	'UNKNOWN_DATATYPE': 'specified datatype is not supported!',
	'UNKNOWN_DATATYPE_PROP': 'column has unsupported/unknown property in datatype definition. run `dana datatype datatype_name` cli command for checking the supported properties for the datatype!'
};

module.exports = {
	title: 'sql_columns',
	description: 'Validates column names and datatypes!',
	invalids: [
		{
			message: { id: errors.REDUNDANT_ID },
			value: {
				id: 'int'
			}
		},
		{
			message: { anInvalidColumnName: errors.INVALID_COLUMN_NAME },
			value: {
				'valid_column_name': 'varchar',
				'anInvalidColumnName': 'int'
			}
		},
		{
			message: { column_name: errors.INAVLID_COLUMN_SPEC_TYPE },
			value: {
				'column_name': 2
			}
		},
		{
			message: { column_name: errors.UNKNOWN_DATATYPE },
			value: {
				'column_name': { type: 'd2' }
			}
		},
		{
			message: { column_name: errors.UNKNOWN_DATATYPE_PROP },
			value: {
				'column_name': { type: 'varchar', unknown_prop: 'value' }
			}
		},
		{
			message: {
				column_name: {
					charset: ['the specified charset is not supported!']
				}
			},
			value: {
				'column_name': { type: 'varchar', charset: 'an_invalid_charset' }
			}
		}
	],
	handler(columns) {
		const colNames = Object.keys(columns);
		return Promise.reduce(colNames, (messages, colName) => {
			if ( colName === 'id' ) {
				messages[colName] = errors.REDUNDANT_ID;
				return messages;
			}
			const colSpec = columns[colName];
			const colSpecType = helpers.getType(colSpec);

			if ( !nameRegex.test(colName) ) {
				messages[colName] = errors.INVALID_COLUMN_NAME;
				return messages;
			}

			if ( !['string', 'object'].includes(colSpecType) ) {
				messages[colName] = errors.INAVLID_COLUMN_SPEC_TYPE;
				return messages;
			}

			const oDatatype = colSpec;
			const dtName = colSpecType === 'string' ? oDatatype : oDatatype.type;
			const bDatatype = datatypes[dtName];
			if ( !dtName || !bDatatype ) {
				messages[colName] = errors.UNKNOWN_DATATYPE;
				return messages;
			}

			const rDatatype = Object.assign({}, bDatatype.defaults, (colSpecType === 'string' ? {} : oDatatype));
			const rDtProps = _.keys(rDatatype);
			const unknownProps = _.without(rDtProps, ...bDatatype.validProps);
			if ( unknownProps.length ) {
				messages[colName] = errors.UNKNOWN_DATATYPE_PROP;
				return messages;
			}
			return mitra.validate(rDatatype, bDatatype.rules).then(() => {
				columns[colName] = rDatatype;
			}).catch(e => {
				columns[colName] = colSpec;
				messages[colName] = e.errors;
			}).return(messages);

		}, {}).then(messages => {
			if ( _.keys(messages).length > 0 ) {
				return messages;
			}
		});
	}
};
