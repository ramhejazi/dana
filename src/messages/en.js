module.exports = {
	schema: {
		// init command messages
		ENSURING_DIRS: 'Ensuring required directories "models" and "migrations" exist...',
		CREATING_DIR: 'Creating missing directory %s ...',
		DIR_EXISTS: 'Directory %s already exists!',
		DIR_CREATED: 'Missing directory %s created successfully!`',
		CONFIG_FILE_EXISTS: '%s already exists!',
		CONFIG_FILE_CREATED: 'Created danafile.js successfully!',

		// ceating models
		INAVLID_TABLE_NAMES: 'Can\'t create models for following table names: %s\
			\ntable names should match %s regular expression. aborting!',
		INVALID_MODEL_EXPORTED_CONTENT: 'Model %s exports a(n) "%s" instead of an object! dana encourages existing models to be valid before creating new models! aborting!',
		MODEL_NAME_NOT_EQUAL_TO_TABLENAME: 'Model "%s" filename is not equal to it\'s tableName: "%s"',
		CREATING_MODELS: 'Creating %s model(s): %s',
		EXISTING_MODEL_FOR_TABLES: 'There are existent model files for following table names: %s',
		EXISTING_MODEL_NAMES: 'Cannot create model(s) for the following table(s): %s \n Reason: There is/are already existent file(s) with .js extension for the specified table(s) and creating new model(s) will overwrite it/them!'

	},
	migrate: {
		CURRUPT_MIGRATION_DIR: 'Currupt migration directory detected. there are %s missing migration file(s): %s',
		UNORDERED_MIGRATION_FILES: 'Currupt migration directory detected. there are %s out of order migration files: %s',
		NO_DIFF: 'No schema change detected!',
		MISSING_DB_CONFIG: 'Missing database connection configuation for the %s environment!',
		CREATED_MIGRATION_FILE: 'Successfully created a new migration file => %s',
		DB_CONNECTION_ERROR: 'dana couldn\'t connect to database. The error is: \n %s',
		MIGRATED_TO_LATEST: 'Successfully executed %s migration file(s). batch number is: %s.',
		ROLLBACKED_MIGRATIONS:'Successfully rollbacked %s migration file(s). batch number was %s.',
		ALREADY_MIGRATED: 'Already to the latest version!',
		NO_ROWS_TO_ROLLBACK: 'No migration item to rollback!',
		ROLLBACKING: 'Rollbacking %s migration item(s) with batch number of %s. migration files are: %s'
	}
};
