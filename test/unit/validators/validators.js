/**
 *	Self-validation of validators!
 *	This script creates 2 mocha tests for each dana validator.
 *	The validators have 2 fields `invalids` and `valides` parameters
 *	that are used for making tests dynamically.
*/

const helpers = require('../../../src/lib/helpers');
const validatorsDirPath = require('path').join(__dirname, '../../../src/validators');
const expect = require('expect.js');
const Promise = require('bluebird');
require('../../../src/loadValidators');

helpers.requireDirFiles(validatorsDirPath + '/*.js').then(files => {
	describe('Validators', function() {
		files.forEach((file) => {
			const { src, name } = file;
			const validator = src.handler;
			const { invalids, valids } = src;
			describe(name, function() {
				if ( valids ) {
					it('should pass for valid values', function() {
						return Promise.each(valids, (el) => {
							el = helpers.getType(el) !== 'object' ? { value: el } : el;
							let { value, attributes = null, key = null } = el;
							let res = validator(value, null, key, null, attributes);
							return Promise.resolve(res).then(result => {
								if ( result ) {
									throw `Validator ${name} didn't pass for valid value: ${value}`;
								}
							});
						});
					});
				}
				if ( invalids ) {
					it('should not pass for invalid values', function() {
						return Promise.each(invalids, (el) => {
							el = helpers.getType(el) !== 'object' ? { value: el } : el;
							let { value, attributes = null, key = null, message } = el;
							let res = validator(value, null, key, null, attributes);
							return Promise.resolve(res).then(result => {
								if ( result ) {
									// Only check expected message when an `invalids` array's item
									// has 'message' property!
									if (message) expect(result).to.eql(message);
								} else {
									throw new Error(`validator ${name} should not pass for invalid value: ${JSON.stringify(value)}`);
								}
							});
						});
					});
				}
			});
		});
	});
});
