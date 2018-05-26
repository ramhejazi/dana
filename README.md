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

## Contents
- [Installation](#installation)
- [Getting Started](https://github.com/ramhejazi/dana/blob/master/docs/getting_started.md)
- [Datatypes](https://github.com/ramhejazi/dana/blob/master/docs/datatypes.md)
- [CLI Commands](#commands)
- [Examples](https://github.com/ramhejazi/dana/blob/master/docs/exmaples.md)

## Installation
Via [npm](https://docs.npmjs.com/getting-started/what-is-npm):
```bash
npm i -g dana
```

Via [yarn](https://yarnpkg.com/en/) package manager:
```bash
yarn global add dana
```
## Commands:
Usage: `dana [options] [command]`

#### Options:

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
