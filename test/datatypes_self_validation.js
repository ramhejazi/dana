const _ = require('lodash');
const mitra = require('mitra');
const datatypes = require('../src/datatypes');

describe('Datatype', function() {
	_.each(datatypes, function(dt, key) {
		describe(`"${key}"`, function() {
			it('should pass self-validation', function() {
				let params;
				if ( ['set', 'enum'].includes(key) ) {
					params = Object.assign({}, dt.defaults, { options: ['one'] });
				} else {
					params = dt.defaults;
				}
				return mitra.validate(params, dt.rules).catch(e => {
					throw new Error(JSON.stringify(e.errors));
				});
			});
		});
	});
});
