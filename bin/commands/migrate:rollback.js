module.exports = {
	cmd: 'migrate:rollback',
	description: 'Rollback migrated migration files.',
	options: [
		['-v, --verbose', 'Logs all main actions.']
	],
	handler(argv, util) {
		return util.getDanaIns()
				.migrate
				.run('rollback', !!this.verbose)
				.then(util.logMessages)
				.catch(util.exit.bind(util));
	}
};
