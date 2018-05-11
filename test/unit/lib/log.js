const log = require('../../../src/lib/log')
	, sinon = require('sinon')
	, expect = require('expect.js');

describe('lib/log', function() {
	describe('._fancify()', function() {
		it('should return colorful message + date', function() {
			expect(log._fancify('red', 'message')).to.match(
				/* eslint-disable no-control-regex */
				/^\u001b\[31m\[\d{4}\/\d\d\/\d\d \d\d:\d\d:\d\d] message\u001b\[39m$/
			);
		});
	});
	describe('.listify()', function() {
		it('should generate correct output', function() {
			expect(log.listify([
				'item_one',
				'item_two',
				'item_three'
			])).to.eql('\n - item_one\n - item_two\n - item_three');
		});
	});

	describe('loggers', function() {
		const originalLog = console.log;
		beforeEach(function() {
			console.log = sinon.spy();
			sinon.spy(log, 'echo');
		});
		afterEach(function() {
			console.log = originalLog;
			log.echo.restore();
		});
		const logMethods = {
			warn: ['warn_message', ['yellow', 'warn_message']],
			info: ['info_message', ['blue', 'info_message']],
			success: ['success_message', ['green', 'success_message']],
			fail: ['error_message', ['red', 'error_message']]
		};
		Object.keys(logMethods).forEach(method => {
			it(`.${method}() should call the .echo() method with correct params`, function() {
				const [message, echo_args] = logMethods[method];
				log[method](message);
				expect(log.echo.withArgs(...echo_args).calledOnce).to.be(true);
			});
		});
	});
});
