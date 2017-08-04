class DanaError extends Error {
	constructor(message, logs) {
		super(message);
		this.logs = logs;
		this.name = this.constructor.name;
		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}
}

module.exports = {
	DanaError,
	SchemaError: class SchemaError extends DanaError {}
};
