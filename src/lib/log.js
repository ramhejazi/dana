const
	chalk 		= require('chalk'),
	timestamp = require('time-stamp');

module.exports = {
	/**
	 * Prepare log message
	 * @param color Chalk module color method
	 * @param message Actual log message
	 * @return {string}
	 */
	_fancify(color, message) {
		const prefix = timestamp('[YYYY/MM/DD HH:mm:ss]');
		return chalk[color](`${prefix} ${message}`);
	},

	/**
	 * Make a list prettified for logging
	 * @param {array} list A list
	 * @return {string}
	 * @example
	 * listify(['one', 'two', 'three']);
	 * > '\n - one\n - two\n - three'
	 */
	listify(list) {
		return `\n - ${list.join('\n - ')}`;
	},

	/**
	 * Log a warning message with color yellow
	 * @param {string} message
	 * @param {boolean} exit Should we exit the current process after loggin?
	 */
	warn(message, exit = false) {
		this.echo('yellow', message, exit);
	},

	/**
	* Log an error message with color red
	* @param {string} message
	* @param {boolean} exit Should we exit the current process after loggin?
	 */
	fail(message, exit = false) {
		this.echo('red', message, exit);
	},

	/**
	* Log a success message with color green
	* @param {string} message
	* @param {boolean} exit Should we exit the current process after loggin?
 */
	success(message, exit = false) {
		this.echo('green', message, exit);
	},

	/**
	* Log a info message with color blue
	* @param {string} message
	* @param {boolean} exit Should we exit the current process after loggin?
	 */
	info(message, exit = false) {
		this.echo('blue', message, exit);
	},

	/**
	 * Log a colorful messsage via console.log
	 * @param {string} color Chalk module color method name
	 * @param {string} message
	 * @param {boolean} exit Should we exit the current process after loggin?
	 */
	echo(color, message, exit) {
		console.log(this._fancify(color, message));
		/* istanbul ignore next */
		if (exit) process.exit(1);
	}

};
