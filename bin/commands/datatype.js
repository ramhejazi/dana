const _ = require('lodash');
const inspect = require('util').inspect;
const chalk = require('chalk');

module.exports = {
	cmd: 'datatype [types...]',
	description: 'Get details about supported MySQL datatypes.',
	alias: 'dt',
	options: [
		['-a, --all', 'Outputs all datatypes']
	],
	handler(argv, util, fields) {
		const log = util.log;
		if (fields.length === 0 && !this.all ) {
			return this.help();
		}
		const dana = util.getDanaIns(false);
		const dtNames = Object.keys(dana.datatypes);
		if ( this.all ) {
			return log.info(dtNames.join('\n'));
		}
		const unknownTypes = _.without(fields, ...dtNames);
		if (unknownTypes.length) {
			log.warn('Unsupported type(s): ' + util.log.listify(unknownTypes), true);
		}
		const types = _.pick(dana.datatypes, fields);
		const ret = Object.keys(types).reduce((ret, el) => {
			const cDefaults = inspect({ defaults: types[el].defaults }, { colors: true }).replace(/[{}]/g, ' ');
			ret.push(`${chalk.bold(el)}:\n${cDefaults}`);
			return ret;
		}, []);

		console.log( chalk.blue(ret.join('\n')) );
	}
};
