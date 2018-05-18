const
	dana = require('../../src/dana')
	, Schema = require('../../src/lib/Schema')
	, Migrate = require('../../src/lib/Migrate')
	, expect = require('expect.js');

describe('dana', function() {

	it('should make an instance properly', function() {
		dana();
	});

	it('should use development as default environment', function() {
		expect(dana().env).to.eql('development');
	});

	it('should return correct configs', function() {
		const configs = {
			connection: {
				host: 'localhost',
				user: 'dana',
				password: 'secret_password',
				database: 'dana'
			}
		};
		const ins = dana(configs);
		expect(ins.config('connection')).to.eql(configs.connection);
		expect(ins.config()).to.eql(configs);
	});

	it('should get instance of Migrate and Schema class properly', function() {
		expect(dana().schema).to.be.a(Schema);
		expect(dana().migrate).to.be.a(Migrate);
	});

});
