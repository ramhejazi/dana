## Getting Started
dana is a npm package. For using the library the package should be installed both locally and globally.

```bash
# installing as an app dependency
$ npm i dana --save
# installing globally as CLI app
$ npm i dana -g
```

After installing the package, you can execute the `dana init` command in the root directory of the project, for creating dana configuration file (`danafile.js`) and it's required directories (`models` and `migrations`):

### Configuration
`danafile.js` is name of dana confugarion file. dana uses `liftoff` package for loading the file. `dana init` command creates a basic configuration file with these contents:

```js
module.exports = {
   development: {
	   connection: {
		   host: 'localhost',
		   user: 'root',
		   password: 'pass',
		   database: ''
	   }
   }
};
```

In the above file `development` (`development` is the default environment) key is treated as environment name and it's `connection` property is passed to `mysql2` library which is used for talking to database.

For adding other environments you can simply add another property to the file:
```js
module.exports = {
   development: {...}
   production: {...}
};
```
``--env`` flag can be used for setting environment:
```bash
dana migrate:latest --env production
```

## Models
For each table a model file (in `models` directory) should be created. dana uses these files for generating migration files. Each model can/must have these properties:
- `tableName` (required|string) - name of the table
- `_fid` (string) an unique ID for each file for tracking changes.
- `schema` (required|object)
- `schema.charset` (string) Table character set.
- `schema.collation` (string) Table collation.
- `schema.indexes` (array) - an array of objects. Each object is treated as an SQL index. See [Defining Indexes]() section.
- `schema.columns` (required|object) - See [Defining Columns ]() section.


### Creating Models
You can create models both manually and by using the `dana generate` command. Since each model **must** have a unique `_fid` property it's recommended to use the `generate` command for creating models. The command generates an unique id for each generated model.

The following command creates 2 model files (`posts.js` and `tags.js`):
```bash
dana generate posts tags
```

### Defining Columns
Each column must be defined as a property of `schema.columns` object. This property must be an object. Name of each property is used as column name and it's value is treated as column datatype. List of all supported datatypes can be found in [datatypes]() section.

An example:

```js
columns: {
  'column_name': { type: 'varchar', nullable: false }
}
```
### Defining Indexes
For creating indexes you can set the `schema.indexes` property of the model to an array. Each element of this array must be an object with these properties:
- `type` (required|string) - type of the index, possible values are: `index`, `fulltext`, `unique`
- `columns` (required|array) - an array of column name(s)

An example:
```js
indexes: [{
	type: 'index',
	columns: ['foo', 'bar']
}, {
	type: 'fulltext',
	columns: ['baz(10)']
}]
```


## Migration
Migration files are created by using Yaml in a directory named `migrations`. These files are generated dynamically by dana and **must not** be modified manually.
Each file has 3 keys:
- `up` - SQL generated by diff-ing current and last stored version of tables (models)
- `down` - SQL generated to rollback to previous version
- `specs` - Current snapshot of models in `models` directory.

### Creating Migration
For creating a migration file dana `migrate:make` CLI command should be executed. The command analyzes project models and creates a migration file with `.yaml` extension.  

### Running migrations
For executing migration files you can run the `migrate:latest` command which executes all the remaining migration files. For rolling-back the latest batch of migration files you can run the `migrate:rollback` command.

dana creates a MySQL table with name of `dana_migrations` for managing and keeping track of executed migration files.   