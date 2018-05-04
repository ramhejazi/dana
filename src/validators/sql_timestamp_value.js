const
	dateFormat = 'YYYY-MM-DD HH:mm:ss'
	, moment = require('moment')
	, { getType } = require('../lib/helpers')
	, sDate = moment('1970-01-01 00:00:01', dateFormat, true)
	, eDate = moment('2038-01-19 03:14:07', dateFormat, true);

const errors = {
	'NOT_STRING': 'Invalid value for the "timestamp" field. Type of value must be a string!',
	'INVALID_FORMAT': 'Invalid value for the "timestamp" field. Value must be a valid UTC date matching "YYYY-MM-DD HH:mm:ss" format!',
	'INVALID_RANGE': 'Invalid value for the "timestamp" field. Value must be a valid date between "1970-01-01 00:00:01" and "2038-01-19 03:14:07"!'
};

module.exports = {
	name: 'sql_timestamp_value',
	description: 'Value must be a valid MySQL timestamp matching "YYYY-MM-DD HH:mm:ss" format!',
	valids: [
		'1970-01-01 00:00:01',
		'2038-01-19 03:14:07',
	],
	invalids: [
		{ value: null, message: errors.NOT_STRING },
		{ value: '2017-12-31 33:59:59', message: errors.INVALID_FORMAT },
		{ value: '2017-12-18---', message: errors.INVALID_FORMAT },
		{ value: '1969-01-01 00:00:00', message: errors.INVALID_RANGE }
	],
	handler(value) {
		const type = getType(value);
		if ( type === 'undefined' ) return;
		if ( type !== 'string' ) {
			return errors.NOT_STRING;
		}
		const date = moment(value, dateFormat, true);
		if ( !date.isValid() ) {
			return errors.INVALID_FORMAT;
		}
		if ( !date.isBetween(sDate, eDate, null, '[]') ) {
			return errors.INVALID_RANGE;
		}
	}
};
