const regex = /^[a-z]([_]?[a-z]+)*$/;

module.exports = {
	title: 'sql_table_name',
	description: 'Validates table names!',
	valids: [
		'table_name', 't', 'tbl_name_two', 'column_name', 'c_one'
	],
	invalids: [
		'table_name1', '_t', 'tbl_name_two_', 'table_Name', 'tableNAME',
		'1_table', 'ta2ble', 'table2', 'Tablename', 'column__name',
		'c__', '', '__clm', '_x_'
	],
	handler(value) {
		if ( !regex.test(value) ) {
			return `invalid tableName property! the "tableName" property must be a string matching "${regex}" regular expression!`;
		}
	}
};
