/**
 * validator: sql_string_length
 */

const validRanges = {
	char: [0, 255],
	varchar: [0, 65535],
	binary: [0, 255],
	varbinary: [0, 65535]
};

module.exports = {
	title: 'sql_string_length',
	description: 'Validates sql varchar and char length!',
	v: Object.keys(validRanges).reduce((ret, key) => {
		const range = validRanges[key];
		ret.push({
			value: range[0],
			attributes: {
				type: key
			}
		});
		ret.push({
			value: range[1],
			attributes: {
				type: key
			}
		});
		return ret;
	}, []),
	i: Object.keys(validRanges).reduce((ret, key) => {
		const range = validRanges[key];
		ret.push({
			value: range[0] - 1,
			attributes: {
				type: key
			}
		});
		ret.push({
			value: range[1] + 1,
			attributes: {
				type: key
			}
		});
		return ret;
	}, []),
	handler(value, options, key, message, attributes) {
		let ranges = validRanges[attributes.type];
		let [min, max] = ranges;
		if (value < min || value > max) {
			return `Length of the "${attributes.type}" type must be a value between ${min} and ${max}. The specified length is: ${value}.`;
		}
	}
};
