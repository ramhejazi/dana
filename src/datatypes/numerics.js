const assign = Object.assign;

module.exports = {
	/**
	 * Numeric Types
	 */
	'int': integer({
		type: 'int',
		width: 11
	}),
	'integer': integer({
		type: 'integer',
		width: 11
	}),
	'tinyint': integer({
		type: 'tinyint',
		width: 3
	}),
	'smallint': integer({
		type: 'smallint',
		width: 6
	}),
	'mediumint': integer({
		type: 'mediumint',
		width: 9
	}),
	'bigint': integer({
		type: 'bigint',
		width: 20
	}),
	'boolean': integer({
		type: 'tinyint',
		width: 1
	}),
	'bool': integer({
		type: 'tinyint',
		width: 1
	}),

	// 'serial': numeric({
	// 	type: 'bigint',
	// 	width: 20,
	// 	unsigned: false,
	// 	nullable: false,
	// 	auto_increment: true
	// }),

	'bit': {
		category: 'numeric',
		sub_category: 'Bit',
		defaults: {
			type: 'bit',
			length: 1,
			nullable: true,
			default: undefined,
			comment: undefined
		},
		rules: {
			type: 'in:bit',
			length: 'integer',
			nullable: 'boolean',
			comment: 'sql_comment',
		},
		generateSQL(d) {
			const sql = [`${d.type.toUpperCase()}(${d.length})`];
			if (d.nullable === false) {
				sql.push('NOT NULL');
			}
			if (d.default !== undefined) {
				sql.push(`DEFAULT ${d.default}`);
			}
			if (d.comment !== undefined) {
				sql.push(`COMMENT ${d.comment}`);
			}
			return sql.join(' ');
		},
	},

	'dec': fixedFloating({
		type: 'dec',
		precision: 10,
		scale: 0
	}),

	'decimal': fixedFloating({
		type: 'decimal',
		precision: 10,
		scale: 0
	}),

	'fixed': fixedFloating({
		type: 'fixed',
		precision: 10,
		scale: 0
	}),

	'numeric': fixedFloating({
		type: 'numeric',
		precision: 10,
		scale: 0
	}),

	'float': fixedFloating({
		type: 'float',
		precision: 12,
		scale: 0
	}, 'Floating'),

	'double': fixedFloating({
		type: 'double',
		precision: 22,
		scale: 0
	}, 'Floating'),

	'real': fixedFloating({
		type: 'real',
		precision: 22,
		scale: 0
	}, 'Floating'),

	'double precision': fixedFloating({
		type: 'double precision',
		precision: 22,
		scale: 0
	}, 'Floating')
};

function integer(params = {}) {
	const defaults = assign({
		type: undefined,
		width: undefined,
		default: undefined,
		nullable: true,
		unsigned: false,
		// auto_increment: false,
		zerofill: false,
		comment: undefined
	}, params);

	const rules = {
		type: 'in:' + params.type,
		width: 'sql_int_display_width',
		nullable: 'boolean',
		default: 'type:undefined,number|sql_int_value',
		unsigned: 'boolean',
		// auto_increment: 'boolean',
		zerofill: 'boolean',
		comment: 'sql_comment'
	};

	return {
		category: 'numeric',
		sub_category: 'integer',
		defaults,
		rules,
		generateSQL(d) {
			const sql = [`${d.type.toUpperCase()}(${d.width})`];
			if (d.unsigned === true) {
				sql.push('UNSIGNED');
			}
			if (d.default !== undefined) {
				sql.push(`DEFAULT ${d.default}`);
			}
			if (d.nullable === false) {
				sql.push('NOT NULL');
			}
			// if (d.auto_increment) {
			// 	sql.push('AUTO_INCREMENT');
			// }
			if (d.zerofill) {
				sql.push('ZEROFILL');
			}
			if (d.comment) {
				sql.push(`COMMENT ${d.comment}`);
			}
			return sql.join(' ');
		}
	};
}

function fixedFloating(params = {}, sub_category = 'Fixed') {
	const defaults = assign({
		precision: 10,
		scale: 0,
		unsigned: false,
		zerofill: false,
		nullable: true,
		default: undefined,
		comment: undefined
	}, params);

	const rules = {
		precision: 'sql_precision',
		scale: 'sql_scale',
		nullable: 'boolean',
		unsigned: 'boolean',
		default: 'type:undefined,number',
		zerofill: 'boolean',
		comment: 'sql_comment'
	};
	return {
		category: 'numeric',
		sub_category: `${sub_category}-Point`,
		rules,
		defaults,
		generateSQL(d) {
			const sql = [`${d.type.toUpperCase()}(${d.precision}, ${d.scale})`];
			if (d.unsigned === true) {
				sql.push('UNSIGNED');
			}
			if (d.default !== undefined) {
				sql.push(`DEFAULT ${d.default}`);
			}
			if (d.nullable === false) {
				sql.push('NOT NULL');
			}
			// if (d.auto_increment) {
			// 	sql.push('AUTO_INCREMENT');
			// }
			if (d.zerofill) {
				sql.push('ZEROFILL');
			}
			if (d.comment) {
				sql.push(`COMMENT ${d.comment}`);
			}
			return sql.join(' ');
		}
	};
}
