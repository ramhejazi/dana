const helpers = require('../../../src/lib/helpers')
	, expect = require('expect.js');

describe('lib/helpers', function() {
	describe('.createDateStr()', function() {
		it('shoud return a currect date string', function() {
			const date_string = helpers.createDateStr();
			expect(date_string).to.have.length(19);
		});
	});
});
