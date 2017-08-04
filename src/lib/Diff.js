const sql = require('./sql');
const _ = require('lodash');
const deepDiff = require('deep-diff').diff;

class Diff {
	constructor(oTables, nTables) {
		this.oTables = oTables;
		this.nTables = nTables;
		this._oIds = _.map(oTables, '_fid');
		this._nIds = _.map(nTables, '_fid');
		this._newIds = _.without(this._nIds, ...this._oIds);
		this._droppedTable = [];
		this._createdTables = [];
		this._logs = [];
		this.up = [];
		this.dn = [];
		this._make();
	}

	getLogs() {
		return this._logs;
	}

	hasChanged() {
		return this.up.length > 0 || this.dn.length > 0;
	}

	getMigrationData() {
		return {
			up: this.up.join('\n'),
			down: this.dn.join('\n')
		};
	}

	_make() {
		this.oTables.forEach(oTable => {
			const nTable = this.nTables.find(ns => ns._fid === oTable._fid);
			if (nTable) {
				this._diffTables(oTable, nTable);
			} else {
				this._dropTable('up', oTable);
				this._createTable('dn', oTable);
			}
		});
		this._newIds.forEach(nId => {
			const nTable = this.nTables.find(tbl => tbl._fid === nId);
			this._createTable('up', nTable);
			this._dropTable('dn', nTable);
			(nTable.schema.indexes || []).forEach(index => {
				this._createIndex('up', nTable.tableName, index);
			});
		});
	}

	_diffTables(oTable, nTable) {
		const oTableName = oTable.tableName;
		const nTableName = nTable.tableName;
		const {
			charset: nCharset,
			collation: nCollation,
			columns: nColumns
		} = nTable.schema;
		const {
			charset: oCharset,
			collation: oCollation,
			columns: oColumns
		} = oTable.schema;

		if (oTableName !== nTableName) {
			this._renameTable('up', oTableName, nTableName);
			this._renameTable('dn', nTableName, oTableName);
		}
		if (nCharset !== oCharset || nCollation !== oCollation) {
			this._changeTableCharset('up', nTableName, nCharset, nCollation, oCharset, oCollation);
			this._changeTableCharset('dn', oTableName, oCharset,oCollation);
		}
		const columnsDiff = deepDiff(oColumns, nColumns) || [];
		columnsDiff.forEach(d => {
			const colName = d.path[0];
			if (d.kind === 'N') {
				const nCol = nColumns[colName];
				this._addColumn('up', nTableName, colName, nCol);
				this._dropColumn('dn', nTableName, colName);
			}
			else if (d.kind === 'E' || d.kind === 'A') {
				const nCol = nColumns[colName];
				const oCol = oColumns[colName];
				this._alterColumn('up', nTableName, colName, nCol);
				this._alterColumn('dn', oTableName, colName, oCol);
			}
			else if (d.kind === 'D') {
				this._dropColumn('up', nTableName, colName);
				this._addColumn('dn', oTableName, colName, oColumns[colName]);
			}
		});

		this._diffTablesIndexes(oTable, nTable);
	}

	_diffTablesIndexes(oTable, nTable) {
		let oIndexes = oTable.indexes || [];
		let nIndexes = nTable.indexes || [];
		oIndexes.forEach(oindex => {
			let findex = nIndexes.find(ni => _.isEqual(ni, oindex));
			if (!findex) {
				this._dropIndex('up', nTable.tableName, oindex);
				this._addIndex('dn', oTable.tableName, oindex);
			}
		});
		nIndexes.forEach(nindex => {
			let findex = oIndexes.find(oindex => _.isEqual(nindex, oindex));
			if (!findex) {
				this._addIndex('up', nTable.tableName, nindex);
				this._dropIndex('dn', oTable.tableName, nindex);
			}
		});
	}

	_createTable(type = 'up', table) {
		this[type] = this[type].concat(sql.createTable(table));
		if ( type === 'up' ) {
			this._log('info', `Creates table "${table.tableName}".`);
		}
	}

	_dropTable(type = 'up', table) {
		this[type].push(sql.dropTable(table.tableName));
		if ( type === 'up' ) {
			this._log('alert', `Drops table "${table.tableName}".`);
		}
	}

	_addColumn(type = 'up', tableName, colName, colDefinition) {
		const colSQL = sql.getColumnSQL(colDefinition);
		this[type].push(sql.addColumn(tableName, colName, colSQL));
	}

	_alterColumn(type = 'up', tableName, colName, colDefinition) {
		const colSQL = sql.getColumnSQL(colDefinition);
		this[type].push(sql.alterColumn(tableName, colName, colName, colSQL));
	}

	_dropColumn(type = 'up', tableName, colName) {
		this[type].push(sql.dropColumn(tableName, colName));
	}

	_renameTable(type = 'up', oTableName, nTableName) {
		this[type].push(sql.renameTable(oTableName, nTableName));
		if ( type === 'up' ) {
			this._log('info', `Rename table "${oTableName}" to ${nTableName}`);
		}
	}

	_createIndex(type = 'up', tableName, index) {
		this[type].push(sql.createIndex(tableName, index));
		if ( type === 'up' ) {
			this._log('info', `Creates "${index.type}" index on table "${tableName}".`);
		}
	}

	_dropIndex(type = 'up', tableName, index) {
		this[type].push(sql.dropIndex(tableName, index));
		if ( type === 'up' ) {
			this._log('alert', `Drops "${index.type}" index on table "${tableName}".`);
		}
	}

	_changeTableCharset(type = 'up', tableName, charset, collation) {
		this[type].push(sql.changeTableCharset(tableName, charset, collation));
	}

	_log(type, message) {
		this._logs.push({ type, message });
	}


}

module.exports = Diff;
