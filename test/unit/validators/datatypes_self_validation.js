/**
	Self-validation of datatypes!
	This script creates 1 mocha test for each datatype.
*/

require('../../../src/loadValidators');
const _ = require('lodash');
const mitra = require('mitra');
const datatypes = require('../../../src/datatypes');
const expect = require('expect.js');

/**
 * The `example` fields checks each unique set of datatypes
 * as an example, as `text` is similar to `longtext`, only `text` dt is checked!
 * @todo Convert the params fields into an array of objects so we can make sure
 * all generateSQL's if statements work properly in isolation
 * @example
 * params: [{type: 'varchar'}, [length: 100] ...]
 *
 */
const examples = {
	'varchar': {
		params: {
			type: 'varchar',
			length: 100,
			default: 'a default text',
			nullable: false,
			collate: 'utf8mb4_unicode_ci',
			charset: 'utf8mb4',
			comment: 'a comment added for `vachar` field!'
		},
		sql: 'VARCHAR(100) NOT NULL DEFAULT \'a default text\' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT \'a comment added for `vachar` field!\''
	},
	'text': {
		params: {
			type: 'text',
			nullable: false,
			collate: 'utf8mb4_unicode_ci',
			charset: 'utf8mb4',
			comment: 'a comment added for `text` field!',
		},
		sql: 'TEXT NOT NULL CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT \'a comment added for `text` field!\''
	},
	'set': {
		params: {
			type: 'set',
			nullable: false,
			default: 'bar',
			collate: 'utf8mb4_unicode_ci',
			charset: 'utf8mb4',
			comment: 'a comment added for `set` field!',
			options: ['foo', 'bar'],
		},
		sql: 'SET(foo,bar) NOT NULL DEFAULT \'bar\' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT \'a comment added for `set` field!\''
	},
	'bit': {
		params: {
			type: 'bit',
			length: 8,
			nullable: false,
			default: 0,
			comment: 'a comment added for `bit` field!'
		},
		sql: 'BIT(8) NOT NULL DEFAULT 0 COMMENT \'a comment added for `bit` field!\''
	},
	'int': {
		params: {
			type: 'int',
			width: 10,
			default: 2,
			nullable: false,
			unsigned: true,
			// auto_increment: false,
			zerofill: true,
			comment: 'a comment added for `int` field!'
		},
		sql: 'INT(10) UNSIGNED NOT NULL DEFAULT 2 ZEROFILL COMMENT \'a comment added for `int` field!\''
	},
	'fixed': {
		params: {
			type: 'fixed',
			precision: 10,
			scale: 2,
			unsigned: true,
			zerofill: true,
			nullable: false,
			default: 2,
			comment: 'a comment added for `fixed` field!'
		},
		sql: 'FIXED(10, 2) UNSIGNED NOT NULL DEFAULT 2 ZEROFILL COMMENT \'a comment added for `fixed` field!\''
	},
	'date': {
		params: {
			type: 'date',
			nullable: false,
			default: '1000-01-02',
			comment: 'a comment for date field!'
		},
		sql: 'DATE NOT NULL DEFAULT \'1000-01-02\' COMMENT \'a comment for date field!\''
	},
	'time': {
		params: {
			type: 'time',
			nullable: false,
			default: '1112',
			fsp: 0,
			comment: 'a comment for time field!'
		},
		sql: 'TIME(0) NOT NULL DEFAULT \'1112\' COMMENT \'a comment for time field!\''
	},
	'datetime': {
		params: {
			type: 'datetime',
			nullable: false,
			on_update: 'CURRENT_TIMESTAMP',
			default: '2017-12-24 23:59:59',
			fsp: 0, // ignored for now, mysql threw an error!
			comment: 'a comment for datetime field!'
		},
		sql: 'DATETIME NOT NULL DEFAULT \'2017-12-24 23:59:59\' ON UPDATE CURRENT_TIMESTAMP COMMENT \'a comment for datetime field!\''
	},
	'timestamp': {
		params: {
			type: 'timestamp',
			nullable: false,
			on_update: 'CURRENT_TIMESTAMP',
			default: '2038-01-19 03:14:07',
			fsp: 0, // ignored for now, mysql threw an error!
			comment: 'a comment for timestamp field!'
		},
		sql: 'TIMESTAMP NOT NULL DEFAULT \'2038-01-19 03:14:07\' ON UPDATE CURRENT_TIMESTAMP COMMENT \'a comment for timestamp field!\''
	},
	'year': {
		params: {
			type: 'year',
			nullable: false,
			default: '2155',
			comment: 'a comment for year field!'
		},
		sql: 'YEAR NOT NULL DEFAULT 2155 COMMENT \'a comment for year field!\''
	},
};

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

	_.each(examples, function(props, dtName) {
		describe(`"${dtName}".generateSQL()`, function() {
			it('should generate expected SQL', function() {
				expect( datatypes[dtName].generateSQL(props.params) ).to.be.eql( props.sql );
			});
		});
	});

});
