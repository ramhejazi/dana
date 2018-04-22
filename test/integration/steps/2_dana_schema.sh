#!/bin/bash
set -x
echo "Step 2: creating schema files"
dana schema:generate posts tags categories --danafile=test_tmp_dir/danafile.js
