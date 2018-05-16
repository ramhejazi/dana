module.exports = {
	schema: {
		// init command messages
		'ENSURING_DIRS': 'ensuring required directories "models" and "migrations"\
			exist...',
		'CREATING_DIR': 'creating missing directory %s ...',
		'DIR_EXISTS': 'directory %s already exists!',
		'DIR_CREATED': 'missing directory %s created successfully!`',
		'CONFIG_FILE_EXISTS': '%s already exists!',
		'CONFIG_FILE_CREATED': 'created danafile.js successfully!',

		// ceating models
		'INAVLID_TABLE_NAMES': 'can\'t create models for following table names: %s\
			\ntable names should match %s regular expression. aborting!',
		'INVALID_MODEL_EXPORTED_CONTENT': 'model %s exports a(n) "%s" instead of an object! \
		dana encourages existing models to be valid before creating new models! aborting!',
		'MODEL_NAME_NOT_EQUAL_TO_TABLENAME': 'model "%s" filename is not equal to it\'s tableName: "%s"',
		'CREATING_MODELS': 'creating %s model(s): %s',
		'EXISTING_MODEL_FOR_TABLES': 'there are existent model files for following table names: %s',
		'EXISTING_MODEL_NAMES': 'cannot create model(s) for the following table(s): %s \n\
			Reason: There is/are already existent file(s) with .js extension for the \
			specified table(s) and creating new model(s) will overwrite it/them!'

	}
};
