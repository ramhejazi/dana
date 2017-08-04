const charsets = require('../charsets');

module.exports = {
	name: 'sql_charset',
	description: 'Element must be a valid mysql charset!',
	valids: [
		'utf8mb4',
		'ucs2',
		undefined
	],
	invalids: [
		'foobar',
		'',
		null
	],
	handler(charset) {
		if (charset === undefined) return;
		if ( !charsets.hasOwnProperty(charset) ) {
			return `The charset "${charset}" is not supported!"`;
		}
	}
};
