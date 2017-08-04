module.exports = {
	cmd: 'init',
	description: 'Create a fresh "danafile" and missing directories.',
	options: [
		['-v, --verbose', 'Logs all main actions.']
	],
	handler(argv, util) {
		util.ensureLocalModule();
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
			log.info('Ensuring required directories "models" and "migrations" exists...');
		}

		Promise.each(['models', 'migrations'], dir => {
			const dirPath = path.join(util.env.cwd, dir);
			return fs.pathExists(dirPath).then(exists => {
				if ( exists ) {
					if (verbose)
						log.warn(`Directory "${tildify(dirPath)}" already exists!`);
					return;
				} else {
					if (verbose)
						log.info(`Creating missing directory "${tildify(dirPath)}" ...`);
					return fs.ensureDir(dirPath).then(() => {
						log.success(`Directory "${tildify(dirPath)}" created!`);
					});
				}
			});
		}).then(() => {
			if (env.configPath) {
				return util.exit(`${tildify(env.configPath)} already exists`);
			}
			return fs.copy(
				path.dirname(env.modulePath) + '/danafile.js',
				path.join(env.cwd, 'danafile.js')
			).then(() => {
				util.log.success('Created danafile.js successfully.');
			});
		}).catch(util.exit.bind(util));
	}
};
