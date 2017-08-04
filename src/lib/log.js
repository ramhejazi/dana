const chalk = require('chalk');

module.exports = {
	warn(msg) {
		this.echo(chalk.yellow('WARN: ' + msg.trim()));
	},
	echo(msg) {
		console.log(`${msg}`);
	},
	alert(msg = '') {
		this.echo(chalk.red('ALERT: ' + msg.trim()));
	},
	fail(msg) {
		msg = msg instanceof Error ? msg.stack : msg;
		this.echo(chalk.red(msg));
	},
	success(msg, exit = false) {
		this.echo(chalk.green(msg));
		if (exit) process.exit(1);
	},
	info(msg) {
		this.echo(chalk.blue(msg));
	}
};
