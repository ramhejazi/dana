const
	chalk 		= require('chalk'),
	timestamp = require('time-stamp');

module.exports = {

	_fancify(color, message) {
		const prefix = timestamp('[YYYY/MM/DD HH:mm:ss]');
		return chalk[color](`${prefix} ${message}`);
	},

	listify(list) {
		return `\n - ${list.join('\n - ')}`;
	},

	warn(message, exit = false) {
		this.echo('yellow', message, exit);
	},

	fail(message, exit = false) {
		message = message instanceof Error ? message.stack : message;
		this.echo('red', message, exit);
	},

	success(message, exit = false) {
		this.echo('green', message, exit);
	},

	info(message, exit = false) {
		this.echo('blue', message, exit);
	},

	echo(color = 'blue', message, exit) {
		console.log(this._fancify(color, message));
		if (exit) process.exit(1);
	}

};
