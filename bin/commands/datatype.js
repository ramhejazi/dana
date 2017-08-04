const _ = require('lodash');

module.exports = {
	cmd: 'datatype [types...]',
	description: 'Get details about supported MySQL datatypes.',
	alias: 'dt',
	options: [
		['-a, --all', 'Outputs all datatypes']
	],
	handler(argv, util, fields) {
		if (fields.length === 0 && !this.all ) {
			return this.help();
		}
		const dana = util.getDanaIns();
		const dtNames = Object.keys(dana.datatypes);
		if ( this.all ) {
			return util.log.info(dtNames.join('\n'));
		}
		const unknownTypes = _.without(fields, ...dtNames);
		if (unknownTypes.length) {
			util.log.warn('Unknown Type(s): ' + unknownTypes.join(', '));
		}
		const types = _.pick(dana.datatypes, fields);
		_.each(types, (value, key) => {
			const defaults = (value.defaults);
			util.log.info(`${key}`);
			util.log.info(JSON.stringify(defaults, null, 4));
		});
	}
};
