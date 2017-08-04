const dateFormat = 'YYYY-MM-DD';
const moment = require('moment');
const { getType } = require('../lib/helpers');
const sDate = moment('1000-01-01', dateFormat, true);
const eDate = moment('9999-12-31', dateFormat, true);

module.exports = {
	name: 'sql_date_value',
	description: 'Value must be a valid MySQL "date" literal matching "YYYY-MM-DD" format!',
	v: [
		'1000-01-02',
		'1020-05-29',
		'9999-12-31',
		undefined,
	],
	i: [
		'1000',
		'500-01-02',
		'100-12-31',
		null,
		1001
	],
	handler(value) {
		const type = getType(value);
		if ( type === 'undefined' ) return;
		if ( type !== 'string' ) {
			return `Invalid type for the "date" field. The given "${type}" type is not supported!`;
		}
		const date = moment(value, dateFormat, true);
		if ( !date.isValid() ) {
			return `Invalid value for the "date" field: "${value}". Value must be a valid date matching "YYYY-MM-DD" format!`;
		}
		if ( !date.isBetween(sDate, eDate, null, '[]') ) {
			return `Invalid value for the "date" field: "${value}". Value must be a valid date between "1000-01-01" and "9999-12-31"!`;
		}
	}
};
