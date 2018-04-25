const regex = /(^-?(\d{1,3}:)?(\d\d:)\d\d)$|(^\d+$)/;

module.exports = {
	name: 'sql_time_value',
	description: `
		Value must be a valid MySQL "time" literal.
		MySQL allow several formats for "time" field but
		dana currently only allows a string matching ${regex} regex as a default value.
	`,
	valids: [
		'11:12:00',
		'-00:11:12',
		1112,
		'1112',
		12,
		'12',
		'-838:59:59',
		undefined
	],
	invalids: [
		null,
		'invalid',
		'-8388:59:598',
	],
	handler(value) {
		if ( value === undefined ) return;
		if ( !regex.test(String(value)) ) {
			return `Invalid value for the "time" field: ${value}! Value should match ${regex} regex!`;
		} 
	}
};
