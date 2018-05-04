const
	datetimeValidator = require('./sql_datetime_value')
	, timestampValidator = require('./sql_timestamp_value');

module.exports = {
	name: 'sql_on_update',
	description: 'Element must be a valid "sql_on_update" value.',
	valids: [
		{
			value: 'CURRENT_TIMESTAMP',
			attributes: {
				type: 'datetime'
			}
		}, {
			value: '1970-01-01 00:00:01',
			attributes: {
				type: 'timestamp'
			}
		}, {
			value: '2020-12-24 23:59:59',
			attributes: {
				type: 'datetime'
			}
		}
	],
	invalids: [
		{
			value: '0900-01-01 00:00:00',
			attributes: {
				type: 'timestamp'
			}
		}, {
			value: '1969-01-01 00:00:00',
			attributes: {
				type: 'timestamp'
			}
		}
	],

	handler(value, options, key, message, attributes) {
		if ( value === undefined ) return;
		const colType = attributes.type;
		const validator = colType === 'timestamp' ? timestampValidator : datetimeValidator;
		if ( value === 'CURRENT_TIMESTAMP' ) {
			return;
		}
		return validator.handler(...arguments);
	}
};
