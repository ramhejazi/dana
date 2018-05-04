module.exports = {
	'varchar': varChar('varchar'),
	'char': varChar('char'),
	'varbinary': varChar('varbinary'),
	'binary': varChar('binary'),

	'text': text('text'),
	'tinytext': text('tinytext'),
	'mediumtext': text('mediumtext'),
	'longtext': text('longtext'),

	'blob': text('blob'),
	'tinyblob': text('tinyblob'),
	'mediumblob': text('mediumblob'),
	'longblob': text('longblob'),

	'enum': enumSet('enum'),
	'set': enumSet('set')
};


function enumSet(type) {
	const defaults = {
		type,
		nullable: true,
		default: undefined,
		collate: undefined,
		charset: undefined,
		comment: undefined,
		options: []
	};
	const rules = {
		type: 'in:' + type,
		options: 'array|sql_enum_set_options',
		collation: 'sql_collation',
		nullable: 'type:boolean',
		charset: 'sql_charset',
		comment: 'sql_comment'
	};
	return {
		type,
		rules,
		defaults,
		category: 'String',
		generateSQL(d) {
			let sql = [`${d.type.toUpperCase()}(${d.options.join()})`];
			if ( d.nullable === false ) {
				sql.push('NOT NULL');
			}
			if ( d.default ) {
				sql.push(`DEFAULT ${d.option}`);
			}
			if ( d.charset ) {
				sql.push(`CHARACTER SET ${d.charset}`);
			}
			if ( d.collate ) {
				sql.push(`COLLATE ${d.collate}`);
			}
			if ( d.comment ) {
				sql.push(`COMMENT '${d.comment}'`);
			}
			return sql.join(' ');
		}
	};
}

function text(type = 'text') {
	const defaults = {
		type,
		nullable: true,
		collate: undefined,
		charset: undefined,
		comment: undefined
	};
	const rules = {
		type: 'in:' + type,
		collation: 'sql_collation',
		nullable: 'type:boolean',
		charset: 'sql_charset',
		comment: 'sql_comment'
	};
	return {
		defaults,
		rules,
		category: 'String',
		generateSQL(d) {
			let sql = [`${d.type.toUpperCase()}`];
			if ( d.nullable === false ) {
				sql.push('NOT NULL');
			}
			if ( d.charset ) {
				sql.push(`CHARACTER SET ${d.charset}`);
			}
			if ( d.collate ) {
				sql.push(`COLLATE ${d.collate}`);
			}
			if ( d.comment ) {
				sql.push(`COMMENT '${d.comment}'`);
			}
			return sql.join(' ');
		}
	};
}

function varChar(type = 'varchar') {
	const defaults = {
		type,
		length: type === 'varchar' ? 255 : 1,
		default: undefined,
		nullable: true,
		collate: undefined,
		charset: undefined,
		comment: undefined
	};
	const rules = {
		type: 'in:' + type,
		default: 'type:undefined,string|sql_string_default_value',
		length: 'number|integer|sql_string_length',
		collation: 'sql_collation',
		nullable: 'boolean',
		charset: 'sql_charset',
		comment: 'sql_comment'
	};
	return {
		defaults,
		rules,
		category: 'String',
		generateSQL(d) {
			let sql = [`${d.type.toUpperCase()}(${d.length})`];
			if ( d.default ) {
				sql.push(`DEFAULT ${d.default}`);
			}
			if ( d.nullable === false ) {
				sql.push('NOT NULL');
			}
			if ( d.charset ) {
				sql.push(`CHARACTER SET ${d.charset}`);
			}
			if ( d.collate ) {
				sql.push(`COLLATE ${d.collate}`);
			}
			if ( d.comment ) {
				sql.push(`COMMENT '${d.comment}'`);
			}
			return sql.join(' ');
		}
	};
}
