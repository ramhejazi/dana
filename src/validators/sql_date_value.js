const
	dateFormat = 'YYYY-MM-DD'
	, moment = require('moment')
	, { getType } = require('../lib/helpers')
	, sDate = moment('1000-01-01', dateFormat, true)
	, eDate = moment('9999-12-31', dateFormat, true);

const errors = {
	'NOT_STRING': 'Invalid value for the "date" field. Type of value must be a string!',
	'INVALID_FORMAT': 'Invalid value for the "date" field. Value must be a valid date matching "YYYY-MM-DD" format!',
	'INVALID_RANGE': 'Invalid value for the "date" field. Value must be a valid date between "1000-01-01" and "9999-12-31"!'
};

module.exports = {
	name: 'sql_date_value',
	description: 'Value must be a valid MySQL "date" literal matching "YYYY-MM-DD" format!',
	valids: [
		'1000-01-02',
		'1020-05-29',
		'9999-12-31',
		undefined,
	],
	invalids: [
		{ value: '1000', message: errors.INVALID_FORMAT },
		{ value: '0500-01-02', message: errors.INVALID_RANGE },
		{ value: '100-12-31', message: errors.INVALID_FORMAT },
		{ value: null, message: errors.NOT_STRING },
		{ value: 1001, message: errors.NOT_STRING },
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
