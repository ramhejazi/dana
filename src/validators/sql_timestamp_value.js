const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const moment = require('moment');
const { getType } = require('../lib/helpers');
const sDate = moment('1970-01-01 00:00:01', dateFormat, true);
const eDate = moment('2038-01-19 03:14:07', dateFormat, true);

module.exports = {
	name: 'sql_timestamp_value',
	description: 'Value must be a valid MySQL timestamp matching "YYYY-MM-DD HH:mm:ss" format!',
	v: [
		'1970-01-01 00:00:01',
		'2038-01-19 03:14:07',
	],
	i: [
		'1970-01-01 00:00:00',
		'2038-01-19 03:14:08'
	],
	handler(value) {
		const type = getType(value);
		if ( type === 'undefined' ) return;
		if ( type !== 'string' ) {
			return `Invalid type for the "timestamp" field. The given "${type}" type is not supported!`;
		}
		const date = moment(value, dateFormat, true);
		if ( !date.isValid() ) {
			return 'Invalid value for the "timestamp" field. Value must be a valid UTC date matching "YYYY-MM-DD HH:mm:ss" format!';
		}
		if ( !date.isBetween(sDate, eDate, null, '[]') ) {
			return 'Invalid value for the "timestamp" field. Value must be a valid date between "1970-01-01 00:00:01" and "2038-01-19 03:14:07"!';
		}
	}
};
