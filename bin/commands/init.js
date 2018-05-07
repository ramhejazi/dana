module.exports = {
	cmd: 'init',
	description: 'Create a fresh "danafile" and missing directories.',
	options: [
		['-v, --verbose', 'Logs all main actions.']
	],
	handler(argv, util) {
		const {
			path,
			fs,
			log,
			Promise,
			env,
			tildify
		} = util;

		const verbose = !!this.verbose;

		if (verbose) {
			log.info('ensuring required directories "models" and "migrations" exists...');
		}

		Promise.each(['models', 'migrations'], dir => {
			const dirPath = path.join(util.env.cwd, dir);
			return fs.pathExists(dirPath).then(exists => {
				if ( exists ) {
					log.warn(`directory "${tildify(dirPath)}" already exists!`);
					return;
				} else {
					if (verbose)
						log.info(`creating missing directory "${tildify(dirPath)}" ...`);
					return fs.ensureDir(dirPath).then(() => {
						log.success(`directory "${tildify(dirPath)}" created!`);
					});
				}
			});
		}).then(() => {
			if (env.configPath) {
				return util.log.warn(`${tildify(env.configPath)} already exists!`, true);
			}
			return fs.copy(
				path.join(__dirname, '../../src/', 'danafile.js'),
				path.join(env.cwd, 'danafile.js')
			).then(() => {
				util.log.success('created danafile.js successfully.');
			});
		}).catch(util.exit.bind(util));
	}
};
