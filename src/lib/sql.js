const datatypes = require('../datatypes');

module.exports = {
	createTable(table) {
		const tableName = table.tableName;
		const {
			charset = 'utf8mb4',
			collation = 'utf8mb4_unicode_ci',
			columns
		} = table.schema;
		let cols = ['  id int(11) UNSIGNED NOT NULL AUTO_INCREMENT,'];
		Object.keys(columns).forEach(name => {
			let colDef = this.getColumnSQL(columns[name]);
			cols.push(`  \`${name}\` ${colDef},`);
		});
		let ret = [];
		cols.push('  PRIMARY KEY (`id`)');
		ret.push(`CREATE TABLE \`${tableName}\` (`);
		ret = ret.concat(cols);
		ret.push(`) ENGINE=InnoDB DEFAULT CHARSET=${charset} COLLATE=${collation};`);
		return ret;
	},

	getColumnSQL(col) {
		const dt = datatypes[col.type];
		if (!dt) {
			throw new Error(`Unknown datatype "${col}"!`);
		}
		return dt.generateSQL(col);
	},

	renameTable(oldName, newName) {
		return `RENAME TABLE \`${oldName}\` TO \`${newName}\`;`;
	},

	dropTable(tbl) {
		return `DROP TABLE ${tbl};`;
	},

	addColumn(tbl, col, spec) {
		return `ALTER TABLE \`${tbl}\` ADD \`${col}\` ${spec};`;
	},

	alterColumn(tbl, oldColName, newColName, spec) {
		return `ALTER TABLE \`${tbl}\` CHANGE COLUMN \`${oldColName}\` \`${newColName}\` ${spec};`;
	},

	dropColumn(tbl, colName) {
		return `ALTER TABLE \`${tbl}\` DROP COLUMN \`${colName}\`;`;
	},

	changeTableCharset(tbl, charset, collate) {
		return `ALTER TABLE \`${tbl}\` CONVERT TO CHARACTER SET ${charset} COLLATE ${collate};`;
	},

	createIndex(tbl, index) {
		const name = tbl + '_' + index.columns.join('_');
		const type = index.type === 'index' ? '' : index.type;
		return `ALTER TABLE \`${tbl}\` ADD ${type.toUpperCase()} INDEX \`${name}\` (${index.columns.join(',')});`;
	},

	dropIndex(tbl, index) {
		const name = tbl + '_' + index.columns.join('_');
		return `ALTER TABLE \`${tbl}\` DROP INDEX \`${name}\`;`;
	}

};
