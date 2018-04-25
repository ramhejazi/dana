const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const moment = require('moment');
const { getType } = require('../lib/helpers');
const sDate = moment('1000-01-01 00:00:00', dateFormat, true);
const eDate = moment('9999-12-31 23:59:59', dateFormat, true);

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
		null,
		'2017-12-31 33:59:59',
		'000-12-31 33:59:59'
	],
	handler(value) {
		const type = getType(value);
		if ( type === 'undefined' ) return;
		if ( type !== 'string' ) {
			return `Invalid type for the "date" field. The given "${type}" type is not supported!`;
		}
		const date = moment(value, dateFormat, true);
		if ( !date.isValid() ) {
			return 'Invalid value for the "datetime" field. Value must be a valid date matching "YYYY-MM-DD HH:mm:ss" format!';
		}
		// [] paramer is for valdating the date inclusively
		if ( !date.isBetween(sDate, eDate, null, '[]') ) {
			return 'Invalid value for the "datetime" field. Value must be a valid date between "1000-01-01" and "9999-12-31"!';
		}
	}
};
