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
