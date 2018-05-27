const datatypes = require('../datatypes');

/**
 * An utility object for making SQL statements
 */
module.exports = {
	/**
	 * Generates SQL for creating new table.
	 * @param {object} table A dana model
	 * @returns {array} Indented SQL line by line as an array
	 */
	createTable(table) {
		const tableName = table.tableName;
		const {
			charset = 'utf8mb4',
			collation = 'utf8mb4_unicode_ci',
			columns
		} = table.schema;
		let cols = ['  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,'];
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
			throw new Error(`Unknown Data Type "${col}"!`);
		}
		return dt.generateSQL(col);
	},

	renameTable(oldName, newName) {
		return `RENAME TABLE \`${oldName}\` TO \`${newName}\`;`;
	},

	dropTable(tbl) {
		return `DROP TABLE \`${tbl}\`;`;
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
		const INDEX_NAME = this._getIndexName(tbl, index);
		const INDEX_TYPE = (index.type === 'index') ? 'INDEX' : `${index.type.toUpperCase()} INDEX`;
		const COLUMNS =  index.columns.map(col => col.replace(/([a-z_]+)/, '`$1`')).join();
		return `ALTER TABLE \`${tbl}\` ADD ${INDEX_TYPE} \`${INDEX_NAME}\` (${COLUMNS});`;
	},

	renameIndex(oldTableName, newTableName, index) {
		const OLD_INDEX_NAME = this._getIndexName(oldTableName, index);
		const NEW_INDEX_NAME = this._getIndexName(newTableName, index);
		return `ALTER TABLE \`${newTableName}\` RENAME INDEX \`${OLD_INDEX_NAME}\` TO \`${NEW_INDEX_NAME}\``;
	},

	dropIndex(tbl, index) {
		const name = tbl + '_' + index.columns.join('_');
		return `ALTER TABLE \`${tbl}\` DROP INDEX \`${name}\`;`;
	},

	_getIndexName(tbl, index) {
		return tbl + '_' + index.columns.join('_');
	}

};
