dana
=====
dana is a simple MySQL migration library and a CLI app written in JavaScript (node.js). It works by **tracking changes** in [models]() and **auto-generating** and executing [migration files]().

> dana currently is a beta software!

## Table of Contents:
- [Installation](#installation)
- [Notable Features](#notable-features-and-limitations)
- [Getting Started](https://github.com/ramhejazi/blob/master/docs/getting_started.md)
- [Datatypes](https://github.com/ramhejazi/blob/master/docs/datatypes.md)
- [CLI Commands](#cli-commands)

## Installation
```
npm i dana --save
```

## Notable Features and Limitations
- It automatically creates SQL by tracking user-defined models. The goal is facilitating the process of database migration.
- dana can execute and rollback it's own generated migration files.
- It doesn't support column renaming. When a column name (a property of `schema.columns`) is changed, the column is dropped and a SQL for creating a new column is generated.
- dana manages table indexes.
- dana currently **doesn't** manage/support foreign keys!
- It automatically creates an auto-incrementing primary key (an `id` column) for each table. This means usage of `id` as column name is not allowed.
- Model files are **validated** before generating migration files. dana doesn't create migration files when models are not valid.

## CLI Commands
Usage: `dana [options] [command]`

Options:

    -V, --version      output the version number
    --danafile [path]  Specify the danafile path.
    --cwd [path]       Specify the working directory.
    --env [name]       environment, default: process.env.NODE_ENV || development
    -h, --help         output usage information


Commands:

    datatype|dt [options] [types...]                  Get details about supported MySQL datatypes.
    init [options]                                    Create a fresh "danafile" and missing directories.
    migrate:latest [options]                          Migrate migration files to the latest version.
    migrate:make [options]                            Track table specification changes and create migration files.
    migrate:rollback [options]                        Rollback migrated migration files.
    schema:generate|schema:gen [options] [tables...]  Generates models for the specified table names.
