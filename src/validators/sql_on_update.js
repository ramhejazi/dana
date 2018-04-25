const datetimeValidator = require('./sql_datetime_value');
const timestampValidator = require('./sql_timestamp_value');

module.exports = {
	name: 'sql_on_update',
	description: 'Element must be a valid "sql_on_update" value.',
	handler(value, options, key, message, attributes) {
		if ( value === undefined ) return;
		const colType = attributes.type;
		const validator = colType === 'timestamp' ? timestampValidator : datetimeValidator;
		if ( typeof value !== 'string' ) {
			return 'Invalid value for the ON UPDATE attribute!';
		}
		if ( value === 'CURRENT_TIMESTAMP' ) {
			return;
		}
		return validator(...arguments);
	}
};
