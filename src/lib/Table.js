const
	mitra          = require('mitra')
	, _            = require('lodash')
	, datatypes    = require('../datatypes');

require('../loadValidators');

// Basic validation rules for each model
const basicRules = mitra.normalizeRules({
	'tableName': 'required|string|sql_table_name',
	'_fid': 'required|string',
	'schema': 'object',
	'schema.columns': 'object|sql_columns',
	'schema.indexes': 'sql_indexes',
	'schema.charset': 'sql_charset',
	'schema.collation': 'sql_collation'
});

/**
	@class responsible for normalizing and validating models
	@author Ram Hejazi
* @license MIT
*
* @property {object} file A normalized file
* @property {string} defaultCharset='utf8mb4' Default charset of the table
* @property {string} defaultCollation='utf8mb4_unicode_ci' Default collation of the table
* @property {object} originalSpec Original content of the file
* @property {object} spec Normalized specification of the table/model
*/
class Table {
	/**
	 * Create a new table instance
	 * @param {object} file A normalized model file
	 */
	constructor(file) {
		this.file = file;
		this.defaultCharset = 'utf8mb4';
		this.defaultCollation = 'utf8mb4_unicode_ci';
		this.originalSpec = file.src;
		this.spec = _.cloneDeep(file.src);
	}

	/**
	 * Validate and normalize the model
	 * @return {promise} Normalized specfications of the table
	 */
	parse() {
		return this._validateAndParse().catch(e => {
			e.file = this.file;
			throw e;
		}).return(this.spec);
	}

	/**
	 * Get the table name
	 * @return {string}
	 */
	getName() {
		return this.spec.tableName;
	}

	/**
	 * Get table columns
	 * @return {object}
	 */
	getColumns() {
		return this.spec.schema.columns;
	}

	_extendCharsetAndCollation() {
		const spec = this.spec;
		const oSpec = this.originalSpec;
		if ( !spec.schema.charset ) {
			oSpec.schema.charset = this.defaultCharset;
			spec.schema.charset = this.defaultCharset;
		}
		if ( !spec.schema.collation ) {
			oSpec.schema.collation = this.defaultCollation;
			spec.schema.collation = this.defaultCollation;
		}
	}


	/**
	 * validate a model overally
	 * @return {Promise} mitra validation promise object
	 */
	_validateAndParse() {
		return mitra.validate(this.spec, basicRules).then(() => {
			this._extendCharsetAndCollation();
		});
	}

	/**
	 * Normalize table specfications without validation
	 */
	static normalizeSpec(spec) {
		const cols = spec.schema.columns;
		const colNames = Object.keys(cols);
		colNames.forEach(colName => {
			let colSpec = cols[colName];
			let colSpecType = typeof colSpec;
			const dtName = (colSpecType === 'string') ? colSpec : colSpec.type;
			const dt = datatypes[dtName];
			colSpec = (colSpecType === 'string') ? {} : colSpec;
			cols[colName] = Object.assign({}, dt.defaults, colSpec);
		});
		return spec;
	}

	/**
	 * Normalize list of table specfications without validation
	 */
	static normalizeSpecs(specs) {
		specs.forEach(this.normalizeSpec);
		return specs;
	}

	/**
	 * Is the value a valid table/column name?
	 * the function uses `sql_table_name` validator
	 * @param {string} value
	 * @return {boolean}
	 */
	static isValidName(value) {
		return mitra.checkSync(value, 'sql_table_name').valid;
	}
}

module.exports = Table;
