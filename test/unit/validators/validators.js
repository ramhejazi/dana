/**
 *	Self-validation of validators!
 *	This script creates 2 mocha tests for each dana validator.
 *	The validators have 2 fields `invalids` and `valides` parameters
 *	that are used for making tests dynamically.
*/

const helpers = require('../../../src/lib/helpers');
const validatorsDirPath = require('path').join(__dirname, '../../../src/validators');
const expect = require('expect.js');

describe('Validators', function() {
	helpers.requireDirFilesSync(validatorsDirPath + '/*.js').forEach((file) => {
		const { src, name } = file;
		const validator = src.handler;
		const { invalids, valids } = src;
		describe(name, function() {
			if ( valids ) {
				it('should pass for valid values', function(fn) {
					let message;
					valids.some(el => {
						el = helpers.getType(el) !== 'object' ? { value: el } : el;
						let { value, attributes = null, key = null } = el;
						let res = validator(value, null, key, null, attributes);
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
						let { value, attributes = null, key, message } = el;
						let res = validator(value, null, key, null, attributes);
						if ( message ) {
							expect(res).to.eql(message);
						}
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
});
