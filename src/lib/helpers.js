const glob = require('glob-promise');
const path = require('path');
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

	/**
	 * Create a string by using the current date and time segments
	 * @returns {string}
	 */
	createDateStr() {
		const d = new Date();
		return [
			d.getFullYear().toString(),
			d.getMonth() + 1,
			d.getDate(),
			d.getHours(),
			d.getMinutes(),
			d.getSeconds()
		].map(this._padSegment).join('_');
	},

	createMigrationFileName() {
		return this.createDateStr();
	}

};
