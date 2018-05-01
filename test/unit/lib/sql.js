const sql = require('../../../src/lib/sql.js')
	, expect = require('expect.js');

describe('lib/sql', function() {
	describe('#getColumnSQL', function() {
		it('should throw error for nonexistent datatypes', function() {
			expect(sql.getColumnSQL).withArgs('nonexistent').to.throwError();
		});
	});
});
