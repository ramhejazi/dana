const _ = require('lodash');

const errors = {
	'NOT_ARRAY': '"options" property must be an array!',
	'EMPTY_SET': '"enum"/"set" field\'s `options` property must have at least one value!',
	'NOT_STRING': '"enum"/"set" field\'s `options` property must only have string values!',
	'NOT_UNIQUE': '"enum"/"set" field\'s `options` must have unique items.'
};

module.exports = {
	name: 'sql_enum_set_options',
	description: 'Value must be a valid "enum" or "set" option array.',
	valids: [
		['foo', 'bar'],
		['one', 'two', '3', '']
	],
	invalids: [
		{ value: {}, message: errors.NOT_ARRAY },
		{ value: [], message: errors.EMPTY_SET },
		{ value: ['one', 'two', '3', 3], message: errors.NOT_STRING },
		{ value: ['one', 'one'], message: errors.NOT_UNIQUE },
	],

	handler(value) {
		if ( !Array.isArray(value) ) {
			return errors.NOT_ARRAY;
		}

		if (value.length === 0) {
			return errors.EMPTY_SET;
		}

		let hasNonStringItem = false;
		const duplicates = _.filter(value, (val, index, iteratee) => {
			if (typeof val !== 'string') {
				hasNonStringItem = true;
				return false;
			}
			return _.includes(iteratee, val, index + 1);
		});

		if ( hasNonStringItem ) {
			return errors.NOT_STRING;
		}

		if ( duplicates.length ) {
			return errors.NOT_UNIQUE;
		}
	}
};
