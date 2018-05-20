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


## Table of contents:
- [Installation](#installation)
- [Getting Started](https://github.com/ramhejazi/dana/blob/master/docs/getting_started.md)
- [Datatypes](https://github.com/ramhejazi/dana/blob/master/docs/datatypes.md)
- [CLI Commands](#cli-commands)
- [Examples](#examples)

## Installation
Via [npm](https://docs.npmjs.com/getting-started/what-is-npm):
```bash
npm i -g dana
```

Via [yarn](https://yarnpkg.com/en/) package manager:
```bash
yarn global add dana
```
## Docs

### Commands:
Usage: `dana [options] [command]`

#### Options:

    -V, --version      output the version number
    -h, --help         output usage information
    --danafile [path]  specify the danafile path.
    --cwd [path]       specify the working directory.
    --env [name]       environment, default: process.env.NODE_ENV || development


#### `dana init [options]`                                    
Creates a fresh `danafile.js` and missing directories: `models` and `migrations`.

#### `dana schema:generate [options] [tables...]`             
Generates model for the specified table names. The table names are checked and validated before creating models.

#### `dana migrate:make [options]`                          
Tracks model specification changes and creates a new migration file. The command doesn't create a migration file when models are invalid or there is no schema change detected.

#### `migrate:latest [options]`                          
Executes all non-executed migration files. All executed migration files are labeled by a batch number which is used during rollbacking the migration files.


#### `dana migrate:rollback [options]`                        
Rollbacks migrated migration files by executing SQL stored in `down` sections of migration files.

#### `dana datatype|dt [options] [types...]`                  
Shows details about supported MySQL datatypes. Example: `dana dt varchar`.

## Examples:

Initialization by using `dana init` command which creates 2 empty directories and a configuration file:

```bash
[ ~/app_directory ] $ dana init
Directory "~/app_directory/models" created!
Directory "~/app_directory/migrations" created!
Created danafile.js successfully.
# checking contents of directories in a tree-like format
[ ~/app_directory ] $ tree
.
├── danafile.js
├── migrations
└── models
```

Creating a new model for `posts` table by using `schema:generate` command:

```bash
[ ~/app_directory ] $ dana schema:generate posts
[ ~/app_directory ] $ tree
.
├── danafile.js
├── migrations
└── models
    └── posts.js
[ ~/app_directory ] $ cat models/posts.js
module.exports = {
    tableName: "posts",
    schema: {
        columns: {}
    },
    _fid: "BkoUoLonf" # unique id for this model
}
```

Creating a migration file by using `dana migrate:make`:
```bash
[ ~/app_directory ] $ dana migrate:make
Successfully created a migration file => ~/app_directory/migrations/20180423140000.yml
# checking contents of the generated file:
[ ~/app_directory ] $ cat migrations/20180423140000.yml
up: |-
  CREATE TABLE `posts` (
    id int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
down: DROP TABLE `posts`;
specs: ...
```
Executing migration files by using `dana migrate:latest` command:

```bash
[ ~/app_directory ] $ dana migrate:latest
WARN: Missing "dana_migrations" table.
Creating "dana_migrations" table...
dana migration table successfully created!
Successfully executed 1 migration file(s).
```

Let's check the database structure:

```bash
mysql> use database_name;
mysql> show tables;
+-----------------+
| Tables          |
+-----------------+
| dana_migrations |
| posts           |
+-----------------+
2 rows in set (0.00 sec)
mysql> describe posts;
+-------+------------------+------+-----+---------+----------------+
| Field | Type             | Null | Key | Default | Extra          |
+-------+------------------+------+-----+---------+----------------+
| id    | int(11) unsigned | NO   | PRI | NULL    | auto_increment |
+-------+------------------+------+-----+---------+----------------+
1 row in set (0.00 sec)
mysql> select * from dana_migrations;
+----+----------------+-------+---------------------+
| id | name           | batch | date                |
+----+----------------+-------+---------------------+
|  1 | 20180423140000 |     1 | 2018-04-23 14:15:32 |
+----+----------------+-------+---------------------+
1 row in set (0.00 sec)
```

Rollbacking the last executed batch of migration(s):

```bash
[ ~/app_directory ] $ dana migrate:rollback
Successfully rollbacked 1 migration files. Batch number was "1".
```

Let's recheck the database structure:

```bash
mysql> use database_name;
mysql> show tables;
+-----------------+
| Tables          |
+-----------------+
| dana_migrations |
+-----------------+
1 row in set (0.00 sec)
mysql> select * from dana_migrations;
Empty set (0.00 sec)
```
