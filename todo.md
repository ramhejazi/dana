- Make sure table's indexes are renamed after renaming a table
- Make sure table indexes are added in `down` section of migration files in
addition to create table statements.
- Make sure all regexes (including index validator regexes) is tested!
- Improve error messages of sql_time_value validator!
- Escape mysql table comments and default values!
- Check logs of Schema class functions
- Add more logging in verbose mode for Migrate class main methods!
