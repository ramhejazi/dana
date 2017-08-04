const charsets = require('../charsets');

module.exports = {
	name: 'sql_collation',
	description: 'Element must be a valid mysql collation!',
	v: [
		{
			value: 'utf8mb4_unicode_ci',
			attributes: {
				charset: 'utf8mb4',
			}
		}
	],
	i: [
		{
			value: 'foo',
			attributes: {
				charset: 'utf8mb4',
			}
		}
	],
	handler(collation, options, key, message, attributes) {
		if ( collation === undefined ) return;
		var charset = key === 'schema.collation' ? attributes.schema.charset : attributes.charset;
		if ( !charset ) {
			return `Invalid charset detected. Charset must be specfied for the specfied "${collation}" collation!`;
		}
		if ( !charsets.hasOwnProperty(charset) ) {
			return `Unknown charset "${charset}"!`;
		}
		if ( !charsets[charset].includes(collation) ) {
			return `Unknown collation. Charset "${charset}" doesn't support the specified "${collation}" collation!`;
		}
	}
};
