const Dana = require('../../src/dana');

module.exports = {
	cmd: 'init',
	description: 'Create a fresh "danafile" and missing directories.',
	options: [
		['-v, --verbose', 'Logs all main actions.']
	],
	handler(argv, util) {
		const verbose = !!this.verbose;
		const baseDir = util.env.cwd;
		return Dana({
			baseDir
		}).schema.init(verbose);
	}
};
