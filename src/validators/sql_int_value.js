/**
 * validator: sql_int_default_value
 */

// Valid default value ranges for integer Types
// The first array elements are valid ranges for signed columns
// and the second elements are ranges for unsigned columns
const validRanges = {
	'int': [
		[-2147483648, 2147483647],
		[0, 4294967295]
	],
	'integer': [
		[-2147483648, 2147483647],
		[0, 4294967295]
	],
	'tinyint': [
		[-128, 127],
		[0, 255]
	],
	'smallint': [
		[-32768, 32767],
		[0, 65535]
	],
	'mediumint': [
		[-8388608, 8388607],
		[0, 16777215]
	],
	'bigint': [
		[-9223372036854775808, 9223372036854775807],
		[0, 18446744073709551615]
	],
	'boolean': [
		[-128, 127],
		[0, 255]
	],
	'bool': [
		[-128, 127],
		[0, 255]
	],
};

module.exports = {
	title: 'sql_int_value',
	description: 'Validates sql integer default value.',
	valids: Object.keys(validRanges).reduce((ret, key) => {
		const [unsigned, signed] = validRanges[key];
		ret.push({
			value: unsigned[0],
			attributes: {
				unsigned: true,
				type: key
			}
		});
		ret.push({
			value: signed[0],
			attributes: {
				unsigned: false,
				type: key
			}
		});
		return ret;
	}, []),
	invalids: Object.keys(validRanges).reduce((ret, key) => {
		const [unsigned, signed] = validRanges[key];
		if ( key === 'bigint' ) return ret;
		ret.push({
			value: unsigned[0] - 1,
			attributes: {
				unsigned: true,
				type: key
			}
		});
		ret.push({
			value: signed[1] + 1,
			attributes: {
				unsigned: false,
				type: key
			}
		});
		return ret;
	}, []),
	handler(value, options, key, message, attributes) {
		if (typeof value === 'undefined') {
			return;
		}
		if (typeof value !== 'number') {
			return `Invalid value for the "${attributes.type}" column!`;
		}
		const type = attributes.type;
		const ranges = validRanges[type];

		if (!ranges) return `Unknown type: ${type}`;
		const [min, max] = ranges[attributes.unsigned ? 0 : 1];
		if (value < min || value > max) {
			return `The default value for the ${attributes.unsigned ? 'unsigned' : 'signed'} ${attributes.type} must be between ${min} and ${max}`;
		} 
	}
};
