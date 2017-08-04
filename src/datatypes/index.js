const mitra = require('mitra');
const strings = require('./strings');
const numerics = require('./numerics');
const dates = require('./date_and_time');
const path = require('path');

const datatypes =  Object.assign({}, strings, numerics, dates);

mitra.addValidators(path.join(__dirname, '../validators'));
mitra.addAlias('sql_comment', 'type:string,undefined|max_length:64');
mitra.addAlias('sql_fsp', 'number|integer|range:0,6');
mitra.addAlias('sql_precision', 'number|integer|range:0,65');
mitra.addAlias('sql_scale', 'number|integer|range:0,30|max:$precision');
mitra.addAlias('sql_int_display_width', 'number|integer|range:0,255');

Object.keys(datatypes).forEach(name => {
	const dt = datatypes[name];
	dt.__key = name;
	dt.rules = mitra.normalizeRules(dt.rules);
	dt.validProps = Object.keys(dt.defaults);
});

module.exports = datatypes;
