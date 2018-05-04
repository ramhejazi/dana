const
	_ = require('lodash')
	, { getType } = require('../lib/helpers');

/**
 * validator: sql_string_default_value
 */
const errors = {
	'ENUM_ERROR': 'Invalid default value for the "enum" field. The specified value must exist in the specified "options" property!',
	'SET_ERROR': 'Invalid default value for the "set" field. The specified items do not exist in the column options!',
	'LENGTH_ERROR': 'The length of default value for the column is bigger than the specified column "length"!',
	'NOT_STRING': 'Invalid default value! Value must only be a string!'
};

module.exports = {
	title: 'sql_string_default_value',
	description: 'Validates "varchar", "char", "set" and "enum" default value.',
	valids: [
		undefined,
		{
			value: 'ONE',
			attributes: {
				type: 'enum',
				options: ['ONE', 'TWO', 'THREE']
			}
		}, {
			value: 'ONE,TWO',
			attributes: {
				type: 'set',
				options: ['ONE', 'TWO', 'THREE']
			}
		}, {
			value: 'string_value',
			attributes: {
				type: 'varchar',
				length: 30
			}
		}
	],
	invalids: [
		{
			message: errors.NOT_STRING,
			value: null
		}, {
			message: errors.ENUM_ERROR,
			value: 'ONE',
			attributes: {
				type: 'enum',
				options: ['TWO', 'THREE']
			}
		}, {
			message: errors.SET_ERROR,
			value: 'ONE',
			attributes: {
				type: 'set',
				options: ['TWO', 'THREE']
			}
		}, {
			message: errors.LENGTH_ERROR,
			value: 'string_value',
			attributes: {
				type: 'varchar',
				length: 4
			}
		}
	],
	handler(value, options, key, message, attributes) {
		if (value === undefined) {
			return;
		}

		if ( getType(value) !== 'string' ) {
			return errors.NOT_STRING;
		}

		if ( attributes.type === 'enum' ) {
			if ( attributes.options.indexOf(value) === -1 ) {
				return errors.ENUM_ERROR;
			}
			return;
		}

		if ( attributes.type === 'set' ) {
			let defaultValues = value.split(',');
			let invalids = _.without(defaultValues, ...attributes.options);
			if ( invalids.length ) {
				return errors.SET_ERROR;
			}
			return;
		}

		/**
		 * 'enum' and 'set' types do not support length so the following `if`
		 * statement must only affect other string-related types
		 */
		if ( value.length > attributes.length ) {
			return errors.LENGTH_ERROR;
		}
	}
};
