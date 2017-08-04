module.exports = {
	cmd: 'schema:generate [tables...]',
	description: 'Generates models for the specified table names.',
	alias: 'schema:gen',
	options: [
		['-v, --verbose', 'Logs all main actions.']
	],
	handler(argv, util, tableNames) {
		if (tableNames.length === 0) {
			return this.help();
		}
		return util.getDanaIns()
			.schema
			.createModels(tableNames, !!this.verbose)
			.catch(util.exit.bind(util));
	}
};
