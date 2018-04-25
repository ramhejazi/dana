const _ = require('lodash');

/**
 * validator: array
 */
module.exports = {
	name: 'sql_enum_set_options',
	description: 'Value must be a valid "enum" or "set" option array.',
	valids: [
		['foo', 'bar'],
		['one', 'two', '3', '']
	],
	invalids: [
		['one', 'two', '3', 3],
		[undefined],
		null,
		3,
		'one'
	],
	handler(value) {
		if ( !Array.isArray(value) ) {
			return '"options" property must be an array!';
		}
		if (value.length === 0) {
			throw '"enum"/"set" field\'s "options" property must have at least one value!';
		}
		let hasNonStringItem = false;
		const duplicates = _.filter(value, (val, index, iteratee) => {
			if (typeof val !== 'string') {
				hasNonStringItem = true;
				return false;
			}
			return _.includes(iteratee, val, index + 1);
		});
		if (hasNonStringItem) {
			return '"enum"/"set" field\'s "options" property must be an array of strings';
		}
		if (duplicates.length) {
			return '"enum"/"set" field\'s "options" must have unique items.';
		}
	}
};
