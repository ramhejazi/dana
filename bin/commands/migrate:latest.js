module.exports = {
	cmd: 'migrate:latest',
	description: 'Migrate migration files to the latest version.',
	options: [
		['-v, --verbose', 'Logs all main actions.']
	],
	handler(argv, util) {
		return util.getDanaIns()
			.migrate
			.run('latest', true)
			.then(util.logMessages)
			.catch(util.exit.bind(util));
	}
};
