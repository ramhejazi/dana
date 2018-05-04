const charsets = require('../charsets');

const errors = {
	'MISSING_CHARSET': 'Missing charset detected. `charset` must be specified for the specified collation!',
	'INVALID_CHARSET': 'The specified mysql `charset` is invalid!',
	'INVALID_COLLATION': 'The specified mysql `collation` is invalid!'
};

module.exports = {
	name: 'sql_collation',
	description: 'Element must be a valid mysql collation!',
	valids: [
		{
			value: 'utf8mb4_unicode_ci',
			attributes: {
				charset: 'utf8mb4',
			}
		}
	],
	invalids: [
		{
			value: 'utf8mb4_unicode_ci',
			attributes: {},
			message: errors.MISSING_CHARSET
		},
		{
			value: 'utf8_sinhala_ci',
			attributes: {
				charset: 'unknown!',
			},
			message: errors.INVALID_CHARSET
		},
		{
			key: 'schema.collation',
			value: 'foo',
			attributes: {
				schema: { charset: 'utf8mb4' },
			},
			message: errors.INVALID_COLLATION
		}
	],
	handler(collation, options, key, message, attributes) {
		if ( typeof collation === 'undefined' ) {
			return;
		}

		var charset = (key === 'schema.collation') ? attributes.schema.charset : attributes.charset;

		if ( !charset ) {
			return errors.MISSING_CHARSET;
		}

		if ( !charsets.hasOwnProperty(charset) ) {
			return errors.INVALID_CHARSET;
		}

		if ( !charsets[charset].includes(collation) ) {
			return errors.INVALID_COLLATION;
		}
	}
};
