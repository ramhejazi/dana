const _ = require('lodash');

/**
 * validator: sql_string_default_value
 */

module.exports = {
	title: 'sql_string_default_value',
	description: 'Validates "varchar", "char", "set" and "enum" default value.',
	handler(value, options, key, message, attributes) {
		if (value === undefined) {
			return;
		}

		if (attributes.type === 'enum') {
			if (attributes.options.indexOf(value) === -1) {
				return `Invalid default value for the "enum" field. The specified value '${value}' doesn't exist in the specified "options" property.`;
			}
		}
		if (attributes.type === 'set') {
			let defaultValues = value.split(',');
			let invalids = _.exclude(defaultValues, ...attributes.options);
			if (invalids.length) {
				return `Invalid default value for the 'set' field. The specified items "${value}" do not exist in the column options.`;
			}
		}

		if (value.length > attributes.length) {
			return `The length of default value for the ${attributes.type} column is bigger than specified column length: ${attributes.length}.`;
		}
	}
};
