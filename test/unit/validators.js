/**
	Self-validation of validators!
	This script creates 2 mocha tests for each dana validator.
	The validators have 2 fields `i`nvalids and `v`alides parameters 
	that are used for making tests.
*/

const helpers = require('../../src/lib/helpers');
const validatorsDirPath = require('path').join(__dirname, '../../src/validators');

helpers.readDirSync(validatorsDirPath).forEach((file) => {
	const { src, name } = file;
	const validator = src.handler;
	const {i: invalids, v: valids} = src;
	if ( !invalids && !valids ) return;
	describe(`Validator ${name}`, function() {
		if ( valids ) {
			it('should pass for valid values', function(fn) {
				let message;
				valids.some(el => {
					el = helpers.getType(el) !== 'object' ? { value: el } : el;
					let { value, attributes = null } = el;
					let res = validator(value, null, null, null, attributes);
					if ( res ) {
						message = res;
						return true;
					}
					return false;
				});
				if ( message ) fn(new Error(message));
				else fn();
			});
		}
		if ( invalids ) {
			it('should not pass for invalid values', function(fn) {
				let message;
				invalids.some(el => {
					el = helpers.getType(el) !== 'object' ? { value: el } : el;
					let { value, attributes = null } = el;
					let res = validator(value, null, null, null, attributes);
					if ( !res ) {
						message = `validator ${name} should not pass for invalid value: ${value}`;
						return true;
					}
					return false;
				});
				if ( message ) fn(new Error(message));
				else fn();
			});
		}
	});
});
