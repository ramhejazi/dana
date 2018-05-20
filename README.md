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

#### `dana migrate:latest [options]`                          
Executes all non-executed migration files. All executed migration files are labeled by a batch number which is used during rollbacking the migration files.


#### `dana migrate:rollback [options]`                        
Rollbacks migrated migration files by executing SQL stored in `down` sections of migration files.

#### `dana datatype|dt [options] [types...]`                  
Shows details about supported MySQL datatypes. Example: `dana dt varchar`.
