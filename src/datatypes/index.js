const strings = require('./strings');
const numerics = require('./numerics');
const dates = require('./date_and_time');
const datatypes =  Object.assign({}, strings, numerics, dates);

Object.keys(datatypes).forEach(name => {
	const dt = datatypes[name];
	dt.__key = name;
	dt.validProps = Object.keys(dt.defaults);
});

module.exports = datatypes;
