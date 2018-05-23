module.exports = {
	/**
	 * Date and Time Types
	 */
	'date': {
		category: 'Date and Time',
		defaults: {
			type: 'date',
			nullable: true,
			default: undefined,
			comment: undefined
		},
		rules: {
			default: 'sql_date_value',
			nullable: 'boolean',
			comment: 'sql_comment'
		},
		generateSQL(d) {
			let sql = ['DATE'];
			if ( d.nullable === false ) {
				sql.push('NOT NULL');
			}
			if ( d.default ) {
				sql.push(`DEFAULT '${d.default}'`);
			}
			if ( d.comment ) {
				sql.push(`COMMENT '${d.comment}'`);
			}
			return sql.join(' ');
		}
	},

	'time': {
		category: 'Date and Time',
		defaults: {
			type: 'time',
			nullable: true,
			comment: undefined,
			default: undefined,
			fsp: 0
		},
		rules: {
			nullable: 'boolean',
			comment: 'sql_comment',
			default: 'sql_time_value',
			fsp: 'sql_fsp'
		},
		generateSQL(d) {
			let sql = ['TIME'];
			if ( d.nullable === false ) {
				sql.push('NOT NULL');
			}
			if ( d.default ) {
				sql.push(`DEFAULT '${d.default}'`);
			}
			if ( d.comment ) {
				sql.push(`COMMENT '${d.comment}'`);
			}
			return sql.join(' ');
		}
	},

	'datetime': {
		category: 'Date and Time',
		defaults: {
			type: 'datetime',
			default: undefined,
			on_update: undefined,
			nullable: true,
			comment: undefined,
			fsp: 0
		},
		rules: {
			nullable: 'boolean',
			default: 'sql_datetime_value',
			on_update: 'sql_on_update',
			comment: 'sql_comment',
			fsp: 'sql_fsp'
		},
		generateSQL(d) {
			let sql = ['DATETIME'];
			if ( d.nullable === false ) {
				sql.push('NOT NULL');
			}
			if ( d.default ) {
				sql.push(`DEFAULT '${d.default}'`);
			}
			if ( d.on_update ) {
				sql.push(`ON UPDATE ${d.on_update}`);
			}
			if ( d.comment ) {
				sql.push(`COMMENT '${d.comment}'`);
			}
			return sql.join(' ');
		}
	},

	'timestamp': {
		category: 'Date and Time',
		defaults: {
			type: 'timestamp',
			default: undefined,
			on_update: undefined,
			nullable: true,
			comment: undefined,
			fsp: 0
		},
		rules: {
			default: 'sql_timestamp_value',
			nullable: 'boolean',
			on_update: 'sql_on_update',
			comment: 'sql_comment',
			fsp: 'sql_fsp'
		},
		generateSQL(d) {
			let sql = ['TIMESTAMP'];
			if ( d.nullable === false ) {
				sql.push('NOT NULL');
			}
			if ( d.default ) {
				sql.push(`DEFAULT '${d.default}'`);
			}
			if ( d.on_update ) {
				sql.push(`ON UPDATE ${d.on_update}`);
			}
			if ( d.comment ) {
				sql.push(`COMMENT '${d.comment}'`);
			}
			return sql.join(' ');
		}
	},

	'year': {
		category: 'Date and Time',
		defaults: {
			type: 'year',
			nullable: true,
			comment: undefined,
			default: undefined
		},
		rules: {
			nullable: 'boolean',
			comment: 'sql_comment',
			default: 'sql_year_value'
		},
		generateSQL(d) {
			let sql = ['YEAR'];
			if ( d.nullable === false ) {
				sql.push('NOT NULL');
			}
			if ( d.default ) {
				sql.push(`DEFAULT ${d.default}`);
			}
			if ( d.comment ) {
				sql.push(`COMMENT '${d.comment}'`);
			}
			return sql.join(' ');
		}
	},
};
