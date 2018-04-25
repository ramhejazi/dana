const {getType} = require('../lib/helpers');
const regex = /^\d+$/;
/**
 * validator: sql_default_year_value
 */
module.exports = {
	title: 'sql_year_value',
	description: 'Value for "year" column must be a 4-digit number in the range 1901 to 2155!',
	valids: [
		1901,
		'2155',
		2018,
		undefined
	],
	invalids: [
		null,
		'2156',
		'1900',
		'299',
		299,
	],
	handler(value) {
		let vType = getType(value);
		if (vType === 'undefined') return;
		if ( !['string', 'number'].includes(vType) ) {
			return 'Value for the "year" column must be a string or a number!';
		}
		const asNumber = +value;
		const asString = String(value);
		const isInRange = asNumber >= 1901 && asNumber <= 2155;

		if ( !regex.test(asString) || asString.length !== 4 || !isInRange ) {
			return `Invalid value for "year" column: ${value}. Value must be a 4-digit number in the range 1901 to 2155!`;
		}
	}
};
