const
	glob     = require('glob-promise')
	, path   = require('path')
	, fs     = require('fs-extra')
	, yaml   = require('js-yaml');

module.exports = {

	_zeroPad(segment) {
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
		].map(this._zeroPad).join('_');
	},

	/**
	 * Create a readable migration file name
	 * @return {string}
	 */
	createMigrationFileName() {
		return this.createDateStr();
	},

	/**
	 * Convert each absolute file path in the list into a file object
	 * file object is simple a object literal
	 * @param {array} files List of absolute file paths
	 * @param {boolean} read=true Should the files be required?
	 * @return {array}
	 * Each returned array element is an object with following properties:
	 * @prop {string} name of the file + it's extension
	 * @prop {string} ext File extension
	 * @prop {string} path Absolute file path
	 * @prop {any} src Contents of the file
	 */
	normalizeFiles(files, read = true) {
		return files.map(filePath => {
			return {
				name: path.basename(filePath, path.extname(filePath)),
				ext: path.extname(filePath).slice(1),
				path: filePath,
				src: read ? require(filePath) : undefined
			};
		});
	},

	/**
	 * Get a list of normalized files in a directory asynchronously
	 * A normalized file is a return value of this.normalizeFiles()
	 * @param glob_path A path compatible with glob module
	 * @param read=true Should the files be required?
	 */
	requireDirFiles(glob_path, read = true) {
		return glob(glob_path).then(files => this.normalizeFiles(files, read));
	},

	/**
	 * Get a list of normalized files in a directory synchronously
	 * A normalized file is a return value of this.normalizeFiles()
	 * @param glob_path A path compatible with glob module
	 * @param read=true Should the files be required?
	 */
	requireDirFilesSync(glob_path, read = true) {
		let files = glob.sync(glob_path);
		return this.normalizeFiles(files, read);
	},

	/**
	 * Load contents of a yaml file
	 * @param {string} path The yaml file's path
	 * @return {any} Converted content of the file
	 */
	readYamlFile(path) {
		return fs.readFile(path, 'utf8').then(contents => {
			return yaml.safeLoad(contents);
		});
	},

	/**
	 * Get type of a datum by using Object.prototype.toString
	 * note that a Date() constructor instance is considered a `date` type
	 * @return {string}
	 */
	getType(value) {
		return Object.prototype
			.toString
			.apply(value)
			.match(/\[object (\w+)\]/)[1]
			.toLowerCase();
	}

};
