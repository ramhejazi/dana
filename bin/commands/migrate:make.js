module.exports = {
	cmd: 'migrate:make',
	description: 'Track table specification changes and create migration files.',
	options: [
		['-v, --verbose', 'Logs all main actions.']
	],
	handler(argv, util) {
		const dana = util.getDanaIns();
		return dana.migrate.run('make', true).then(util.logMessages).catch(util.exit.bind(util));
	}
};
