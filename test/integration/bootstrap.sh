#!/bin/bash

set -x
cd test/integration

DB_NAME=dana
DB_ROOT_PASSWORD=secret_password

declare -a test_files=($(ls ./steps))

rm -rf test_tmp_dir && mkdir test_tmp_dir

mysql -uroot -p$DB_ROOT_PASSWORD -e "DROP DATABASE $DB_NAME;"
mysql -uroot -p$DB_ROOT_PASSWORD -e "CREATE DATABASE $DB_NAME;"

# check to see dana has been installed as a global program!
if ! [ -x "$(command -v dana)" ]; then
  echo 'Error: dana is not installed as a global program! Aborting.' >&2
  exit 1
fi

for file in "${test_files[@]}"
do
  bash "./steps/$file"
done
