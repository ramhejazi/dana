#!/bin/bash
set -x
echo "Step 3: creating, executing, rollbacking migration files"
dana migrate:make --danafile=test_tmp_dir/danafile.js
dana migrate:latest --danafile=test_tmp_dir/danafile.js
dana migrate:latest --danafile=test_tmp_dir/danafile.js
dana migrate:rollback --danafile=test_tmp_dir/danafile.js
dana migrate:latest --danafile=test_tmp_dir/danafile.js
