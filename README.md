<div align="center">
	<h1>dana</h1>
	<a href="https://travis-ci.org/ramhejazi/dana">
 		<img src="https://img.shields.io/travis/ramhejazi/dana.svg">
	</a>
	<a href="https://www.npmjs.com/package/dana">
		<img alt="dana npm version" src="https://img.shields.io/npm/v/dana.svg?style=flat-square">
	</a>
	<a href="https://www.npmjs.com/package/dana">
		<img alt="dana downloads count" src="https://img.shields.io/npm/dt/dana.svg?style=flat-square">
	</a>
	<a href="https://coveralls.io/github/ramhejazi/dana">
		<img alt="dana coverage status" src="https://coveralls.io/repos/github/ramhejazi/dana/badge.svg">
	</a>
	<a href="https://github.com/ramhejazi/dana/blob/master/LICENSE">
		<img alt="dana license" src="https://img.shields.io/npm/l/dana.svg">
	</a>
</div>
<br>

> `dana` is a _simple_, _small_ and _framework-agnostic_ database migration tool (CLI) written in JavaScript (node.js).


`dana` works like git somehow. It _tracks_ changes in user-defined models – simple JavaScript objects representing database tables – and _generates_ migration files.   

Key notes:

- Simple to learn, in fact, **no APIs to learn**. `dana` _auto-generates_ migration files. User just need to create models and run simple commands.
- Models are **validated**. Migration files are generated only when models are valid!
- Generates formatted, readable SQL.
- Migrations files are created by using [YAML](http://yaml.org) – a human-readable data serialization language.
- Supports rollbacking. Generated migration files contain required SQL for downgrading to previous state.
- Migration files also contain snapshot of current database structure.
- Currently, it **only supports MySQL** database.
- Supports all MySQL data types, excluding [Spatial](https://dev.mysql.com/doc/refman/5.7/en/spatial-type-overview.html) and [JSON](https://dev.mysql.com/doc/refman/5.7/en/json.html).

### Differences with other migration libraries:
There are some popular and stable migration libraries:
- [Rails Framework's Active Record Migrations](http://guides.rubyonrails.org/active_record_migrations.html) (Ruby)
- [Laravel Framework's Migration System](https://laravel.com/docs/5.6/migrations) (PHP)
- [knex query builder's Migrations](http://knexjs.org/#Migrations) (JavaScript)

These tools provide APIs for defining/redefining database schemata. User creates migration files and uses these APIs for creating/editing/deleting tables, columns, indices and foreign keys. User also needs to code by using these APIs for reversing/undoing all the schema modifications for rollbacks.

`dana` doesn't provide such APIs. It generates migration files by tracking and analyzing user-defined models. User creates/edits/deletes models (one model for each table), executes a CLI command (`dana migrate:make`) and a new migration file is generated.

An example for `dana` models:
```js
module.exports = {
  tableName: 'posts',
  schema: {
    columns: {
      'title': { type: 'varchar', nullable: false, comment: 'a comment!' },
      'slug': 'varchar',
      'author_id': 'int',
      'created_at': 'datetime',
      'updated_at': 'datetime'
    },
    indexes: [{
      type: 'unique',
      columns: ['title']
    }]
  },
  _fid: "sybwcf_tg"
}
```

An example for `dana` migration files:
```yaml
up: |-
  CREATE TABLE `posts` (
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL COMMENT 'a comment!',
    `slug` VARCHAR(255),
    `author_id` INT(11),
    `created_at` DATETIME,
    `updated_at` DATETIME,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  ALTER TABLE `posts` ADD UNIQUE INDEX `posts_title` (`title`);
down: DROP TABLE `posts`;
specs: ...
```

#### Pros:
- No APIs to learn/remember!
- Faster development.
- Migration files' `up` and `down` sections only contain SQL.
- Makes checking database structure easier.

#### Cons:
- `dana` is still in its infancy!
- Currently only supports MySQL. Mentioned libraries support other SQL databases like Postgres,  Microsoft SQL Server, SQLite, and Oracle! (Support varies)
- Currently doesn't support foreign key constraints!

## Docs:
- [Installation](#installation)
- [Setup](#setup)
- [Models](#models)
	- [Model Identifiers](#model-identifiers-_fid)
	- [Creating Tables](#creating-tables)
	- [Renaming Tables](#renaming-tables)
	- [Dropping Tables](#dropping-tables)
	- [Creating Columns](#creating-columns)
	- [Renaming Columns](#renaming-columns)
	- [Modifying Columns](#modifying-columns)
	- [Dropping Columns](#dropping-columns)
	- [Creating Indexes](#creating-indexes)
	- [Modifying Indexes](#modifying-indexes)
	- [Dropping Indexes](#dropping-indexes)
- [Migrations](#migrations)
- [Datatypes](https://github.com/ramhejazi/dana/blob/master/docs/datatypes.md)
- [CLI Commands](#commands)
- [Examples](https://github.com/ramhejazi/dana/blob/master/docs/exmaples.md)

### Installation
`dana` is available on [npm](https://docs.npmjs.com/getting-started/what-is-npm). It can be installed both locally and globally.

Installing globally via npm:
```bash
npm i -g dana
```

Via [yarn](https://yarnpkg.com/en/) package manager:
```bash
yarn global add dana
```

### Setup

`dana` needs 2 directories (`models` and `migrations`) and a configuration file (`danafile.js`). The file and directories can be created either manually or by using `dana init` command.

`dana init` command creates a basic configuration file with these contents:

```js
module.exports = {
  development: {
    connection: {
      host: 'localhost',
      database: 'db_name',
      user: 'db_user',
      password: 'db_user_pass'
    }
  }
}
```

In the above file `development` (`development` is the default environment) key is treated as environment name and it's `connection` property is passed to [`mysql2`](https://github.com/sidorares/node-mysql2) library which is used for talking to database.

For adding other environments you can simply add another property to the file:
```js
module.exports = {
   development: {...}
   production: {...}
};
```
``--env`` flag can be used for setting environment:
```bash
$ dana migrate:latest --env production
```

### Models
For each table a model file, in `models` directory, should be created. A model is a simple node module, exporting a basic JavaScript object. Model files are used for generating migration files.

Each model can or must have these properties:

- `tableName` (**required** `string`) Table name of the model
- `schema` (**required** `object`)
- `schema.columns` (**required** `object`) - See [Defining Columns ]() section.
- `schema.charset` (`string`) Table character set. Default: `'utf8mb4'`
- `schema.collation` (`string`) Table collation. Default: `'utf8mb4_unicode_ci'`
- `schema.indexes` (`array`) An array of objects. Each object is treated as an SQL index. See [Defining Indexes]() section.
- `_fid` (**required** `string`) An unique identifier for the model.

#### Model Identifiers (`_fid`)
Each model **must** have an unique `_fid` property. `dana` relies on existence of these properties for keeping track of table modifications. You **must not** change the `_fid` properties of tracked models after running `migrate:make` command! Otherwise, the old table is **dropped** and a _new_ table is **created** as `dana` assumes the old model has been deleted and a new model has been created!

> The `_fid` exists as there is no solid way to uniquely identify each file on different file systems!

`dana schema:generate` command can be used for creating base models for specified table names. The command also assigns an unique `_fid` to each created model!

#### Creating Tables
For creating a table a new model should be created.
It's recommended to use `schema:generate` for creating models which also assigns a
required unique file id to each generated model.

As an example, the following command creates 3 models in `models` directory:

```bash
dana schema:generate posts categories tags
```
> The table is created after running `migrate:make` for making a migration file and running `migration:latest` for executing migration files!

#### Renaming Tables
Simply change the model `tableName` property.

#### Dropping Tables
A table is dropped when removal of the corresponding model is detected.

#### Creating Columns
For adding a column to a table, a property should be added to `schema.columns` property
of the table's model. The property name is the column name and it's value column definitions. The value can be a string (shorthand) or an object.

Example:
```js
  schema: {
    columns: {
      'username': 'varchar',
      'real_name': { type: 'varchar', length: 40 },
      'bio': { type: 'text' }
    }
  }
```
See [Supported Data Types](https://github.com/ramhejazi/dana/blob/master/docs/datatypes.md) for more details.

#### Renaming Columns
`dana` doesn't support table renaming operation as there is no way to detect which property has been changed without using an unique ID for each column (makes everything complicated) or guessing (will have unwanted side-effects).

#### Modifying Columns
Change the definitions of the column.

#### Dropping Columns
Remove the corresponding column property from the table's model.

#### Creating Indexes
For creating indexes you can set the `schema.indexes` property of the model to an array. Each element of this array represents an index and must be an object with these properties:

- `type` (**required** `string`)
Type of the index. Possible values are: `'index'`, `'fulltext'` and `'unique'`
- `columns` (**required** `array`) An array of column name(s) for the index

Example:
```js
schema: {
  columnsL ...
  indexes: [{
    type: 'index',
    columns: ['foo', 'bar']
  }, {
    type: 'fulltext',
    columns: ['baz(10)']
  }]
}
```

#### Modifying Indexes
Change an object representing the index. SQL for dropping the old index and creating new index will be generated.

#### Dropping Indexes
Remove the corresponding object for the index.

### Migrations
Migration files are created by using Yaml in the `migrations` directory. These files are generated dynamically by `dana` and **must not** be modified manually. Each file has 3 keys:

- `up` - SQL generated by diff-ing current and last stored version of models.
- `down` - SQL generated for rollbacking to previous version.
- `specs` - Current snapshot of models in `models` directory.

#### Creating Migrations
For creating a migration file `dana migrate:make` CLI command should be executed. The command analyzes project models and creates a migration file with `.yml` extension.

#### Running migrations
For executing migration files you can run the `dana migrate:latest` command which executes all the remaining migration files. For rolling-back the latest batch of migration files you can run the `dana migrate:rollback` command.

`dana` creates a MySQL table with name of `dana_migrations` for managing and keeping track of executed migration files.

## Commands:
Usage: `dana [options] [command]`

### Options:

    -V, --version      output the version number
    -h, --help         output usage information
    --danafile [path]  specify the danafile path.
    --cwd [path]       specify the working directory.
    --env [name]       environment, default: process.env.NODE_ENV || development


### `dana init`
Creates a fresh `danafile.js` and missing directories: `models` and `migrations`.

### `dana schema:generate [tables...]`             
Generates model for the specified table names. The table names are checked and validated before creating models.

### `dana migrate:make`                          
Tracks model specification changes and creates a new migration file. The command doesn't create a migration file when models are invalid or there is no schema change detected.

### `dana migrate:latest`                          
Executes all non-executed migration files. All executed migration files are labeled by a batch number which is used during rollbacking the migration files.

### `dana migrate:rollback`                        
Rollbacks migrated migration files by executing SQL stored in `down` sections of migration files.

### `dana datatype|dt [types...]`                  
Shows details about supported MySQL datatypes. Example: `dana dt varchar`.

## License
[MIT](https://github.com/ramhejazi/dana/blob/master/LICENSE)
