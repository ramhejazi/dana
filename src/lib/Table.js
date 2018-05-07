const mitra = require('mitra');
const helpers = require('./helpers');
const _ = require('lodash');
const Promise = require('bluebird');
const {
	SchemaError
} = require('../errors');
const datatypes = require('../datatypes');

// Basic validation rules
let basicRules = mitra.normalizeRules({
	'tableName': 'required|string',
	'_fid': 'required|string',
	'schema': 'object',
	'schema.columns': 'object',
	'schema.indexes': 'sql_indexes',
	'schema.charset': 'sql_charset',
	'schema.collation': 'sql_collation'
});

class Table {
	constructor(file) {
		this.file = file;
		this.defaultCharset = 'utf8mb4';
		this.defaultCollation = 'utf8mb4_unicode_ci';
		this.originalSpec = file.src;
		this.spec = _.cloneDeep(file.src || {});
	}

	parse() {
		return this._validateBasic().then(() => {
			this._validateTableName();
			this._extendCharset();
			return this._normalizeColumns();
		}).catch(e => {
			e.file = this.file;
			throw e;
		}).return(this.spec);
	}

	static normalizeSpec(spec) {
		const cols = spec.schema.columns;
		const colNames = Object.keys(cols);
		colNames.forEach(colName => {
			let colSpec = cols[colName];
			const dtName = typeof colSpec === 'string' ? colSpec : colSpec.type;
			const dt = datatypes[dtName];
			colSpec = typeof colSpec === 'string' ? {} : colSpec;
			cols[colName] = Object.assign({}, dt.defaults, colSpec);
		});
		return spec;
	}

	static normalizeSpecs(specs) {
		specs.forEach(this.normalizeSpec);
		return specs;
	}

	getName() {
		return this.spec.tableName;
	}

	getColumns() {
		return this.spec.schema.columns;
	}

	_extendCharset() {
		const spec = this.spec;
		const oSpec = this.originalSpec;
		if ( !spec.schema.hasOwnProperty('charset') ) {
			oSpec.schema.charset = this.defaultCharset;
			spec.schema.charset = this.defaultCharset;
		}
		if ( !spec.schema.hasOwnProperty('collation') ) {
			oSpec.schema.collation = this.defaultCollation;
			spec.schema.collation = this.defaultCollation;
		}
	}

	_normalizeDataype(colName, oDatatype) {
		const dtJsType = typeof oDatatype;
		const dtName = dtJsType === 'string' ? oDatatype : oDatatype.type;
		const bDatatype = datatypes[dtName];
		if ( !dtName || !bDatatype ) {
			throw `Invalid datatype specified for the "${colName}" column!`;
		}
		const rDatatype = Object.assign({}, bDatatype.defaults, dtJsType === 'string' ? {} : oDatatype);
		const rDtProps = _.keys(rDatatype);
		const unknownProps = _.without(rDtProps, ...bDatatype.validProps);
		if (unknownProps.length) {
			throw `Column "${colName}" has unknown properties (${unknownProps}) for the "${dtName}" datatype.`;
		}
		return mitra.validate(rDatatype, bDatatype.rules).then(() => {
			return rDatatype;
		}).catch(mitra.ValidationError, (e) => {
			let message = `Invalid column definition ${colName}\n`;
			message += Object.keys(e.errors).map(key => `--- ${key}: ${e.errors[key]}`).join('\n');
			throw new SchemaError(message);
		});

	}

	_normalizeColumns() {
		let cols = this.getColumns();
		return Promise.each(Object.keys(cols), (colName) => {
			if ( colName === 'id' ) {
				let e = new SchemaError('column name "id" is preserved! dana automatically creates an "id" column for each table!');
				e.file = this.file;
				throw e;
			}
			const colSpec = cols[colName];
			const colSpecType = helpers.getType(colSpec);
			if ( !this.constructor.isValidName(colName) ) {
				throw `Invalid column name: "${colName}"!`;
			}

			if ( !['string', 'object'].includes(colSpecType) ) {
				throw `Column definition must be either a string or an object. The given type is ${colSpecType}!`;
			}

			return this._normalizeDataype(colName, colSpec).then(datatype => {
				cols[colName] = datatype;
			});
		});
	}

	/**
	 * validate a model overally
	 * this validator simply does type-checking of properties
	 * @return {Promise} mitra validation promise object
	 */
	_validateBasic() {
		return mitra.validate(this.spec, basicRules);
	}

	_validateTableName() {
		if ( !this.constructor.isValidName(this.tableName) ) {
			throw new SchemaError(
				`the tableName property must be a string matching "${this.constructor.getNameRegex()}" regular expression!`
			);
		}
	}

	static getNameRegex() {
		return /^[a-z]([_]?[a-z]+)*$/;
	}

	static isValidName(name) {
		return this.getNameRegex().test(name);
	}

}

module.exports = Table;
