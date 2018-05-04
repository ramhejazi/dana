const
	dateFormat = 'YYYY-MM-DD HH:mm:ss'
	, moment = require('moment')
	, { getType } = require('../lib/helpers')
	, sDate = moment('1000-01-01 00:00:00', dateFormat, true)
	, eDate = moment('9999-12-31 23:59:59', dateFormat, true);

const errors = {
	'NOT_STRING': 'Invalid value for the "date" field. Type of value must be a string!',
	'INVALID_FORMAT': 'Invalid value for the "date" field. Value must be a valid date matching "YYYY-MM-DD HH:mm:ss" format!',
	'INVALID_RANGE': 'Invalid value for the "date" field. Value must be a valid date between "1000-01-01" and "9999-12-31"!'
};

module.exports = {
	name: 'sql_date_value',
	description: 'Value must be a valid MySQL datetime matching "YYYY-MM-DD HH:mm:ss" format!',
	valids: [
		'1000-01-01 00:00:00',
		'9999-12-31 23:59:59',
		'2017-12-24 23:59:59',
		undefined
	],
	invalids: [
		{ value: null, message: errors.NOT_STRING },
		{ value: '2017-12-31 33:59:59', message: errors.INVALID_FORMAT },
		{ value: '2017-12-18---', message: errors.INVALID_FORMAT },
		{ value: '0900-01-01 00:00:00', message: errors.INVALID_RANGE }
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
		// [] paramer is for valdating the date inclusively
		if ( !date.isBetween(sDate, eDate, null, '[]') ) {
			return errors.INVALID_RANGE;
		}
	}
};
