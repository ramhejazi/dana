dana
=====
#### Database migration CLI program (nodejs)
[![npm](https://img.shields.io/npm/v/dana.svg?style=flat-square)](https://www.npmjs.com/package/dana)
[![npm](https://img.shields.io/npm/dt/dana.svg?style=flat-square)](https://www.npmjs.com/package/dana)

dana is a database (currently, only MySQL) migration program written in JavaScript (node.js). It works by **tracking changes** in models and **auto-generating** and executing migration files.

Yet another database migration library? It's somehow different. Nearly all database migration libraries/tools work with user-generated migration files. dana auto-generates the migration files. Where does it get the data? User-defined models. You change the models, it tracks the changes and then creates a new migration file!

## Table of Contents:
- [Installation](#installation)
- [Notable Features](#notable-features-and-limitations)
- [Getting Started](https://github.com/ramhejazi/dana/blob/master/docs/getting_started.md)
- [Datatypes](https://github.com/ramhejazi/dana/blob/master/docs/datatypes.md)
- [CLI Commands](#cli-commands)
- [Examples](#examples)

## Installation
```bash
npm install -g dana
```

## Notable Features and Limitations
- It automatically creates SQL by tracking user-defined models. The goal is facilitating the process of database migration.
- dana can execute and rollback it's own generated migration files.
- It doesn't support column renaming. When a column name (a property of `schema.columns`) is changed, the column is dropped and a SQL for creating a new column is generated.
- dana manages table indexes.
- dana currently **doesn't** manage/support foreign keys!
- It automatically creates an auto-incrementing primary key (an `id` column) for each table. This means usage of `id` as column name is not allowed.
- Model files are **validated** before generating migration files. dana doesn't create migration files when models are not valid.

## Commands
Usage: `dana [options] [command]`

Options:

    -V, --version      output the version number
    --danafile [path]  Specify the danafile path.
    --cwd [path]       Specify the working directory.
    --env [name]       environment, default: process.env.NODE_ENV || development
    -h, --help         output usage information


Commands:

    init [options]                                    Create a fresh "danafile" and missing directories.
    schema:generate [options] [tables...]             Generate models for the specified table names.
    migrate:make [options]                            Track table specification changes and create migration files.
    migrate:latest [options]                          Migrate migration files to the latest version.
    migrate:rollback [options]                        Rollback migrated migration files.
    datatype|dt [options] [types...]                  Get details about supported MySQL datatypes. Example: `dana dt varchar`

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
down: DROP TABLE posts;
specs: >-
  [{"tableName":"posts","schema":{"columns":{},"charset":"utf8mb4","collation":"utf8mb4_unicode_ci"},"_fid":"BkoUoLonf"}]
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
