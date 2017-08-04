const glob = require('glob-promise');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs-extra');
const yaml = require('js-yaml');

module.exports = {
	readDir(dir_path, read = true) {
		return glob(dir_path).then(files => this._normalizeFiles(files, read));
	},

	readDirSync(dir_path, pattern = '**.js') {
		let files = glob.sync(dir_path + '/' + pattern);
		return this._normalizeFiles(files);
	},

	readYamlFile(path) {
		return fs.readFile(path, 'utf8').then(contents => {
			return yaml.safeLoad(contents);
		});
	},

	getType(value) {
		return Object.prototype
			.toString
			.apply(value)
			.match(/\[object (\w+)\]/)[1]
			.toLowerCase();
	},

	_normalizeFiles(files, read = true) {
		return files.map(filePath => {
			return {
				name: path.basename(filePath, path.extname(filePath)),
				ext: path.extname(filePath).slice(1),
				path: filePath,
				src: read ? require(filePath) : undefined
			};
		});
	},

	_padSegment(segment) {
		segment = segment.toString();
		return segment[1] ? segment : `0${segment}`;
	},

	// Get a date object in the correct format, without requiring a full out library
	// like "moment.js".
	createDateStr() {
		const d = new Date();
		return d.getFullYear().toString() +
			this._padSegment(d.getMonth() + 1) +
			this._padSegment(d.getDate()) +
			this._padSegment(d.getHours()) +
			this._padSegment(d.getMinutes()) +
			this._padSegment(d.getSeconds());
	},

	makeDiffHash(diff) {
		const hash = crypto.createHash('sha1');
		const content = diff.up + diff.down + diff.schema;
		hash.setEncoding('hex').write(content);
		hash.end();
		return hash.read();
	},

	createMigrationFileName() {
		return this.createDateStr();
	}

};
