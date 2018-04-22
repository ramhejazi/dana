#!/bin/bash

set -x

LOG_FILE=/vagrant/vagrant_build.log

DB_ROOT_PASSWORD=secret_password
DB_NAME=dana
DB_USER=dana
DB_USER_PASS=secret_password

rm $LOG_FILE && touch $LOG_FILE

echo -e "--- Initial update... ---"
apt-get update

echo -e "--- Installing basic packages... ---"
apt-get install -y curl build-essential git htop vim python-software-properties >> $LOG_FILE 2>&1

# MySQL setup
echo -e "--- Installing MySQL server ---"
debconf-set-selections <<< "mysql-server mysql-server/root_password password $DB_ROOT_PASSWORD"
debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $DB_ROOT_PASSWORD"
apt-get -y install mysql-server >> $LOG_FILE 2>&1

echo -e "--- Setting up MySQL user and database ---"
mysql -uroot -p$DB_ROOT_PASSWORD -e "CREATE DATABASE $DB_NAME" >> /vagrant/vm_build.log 2>&1
mysql -uroot -p$DB_ROOT_PASSWORD -e "grant all privileges on $DB_NAME.* to '$DB_USER'@'localhost' identified by '$DB_USER_PASS'" >> $LOG_FILE 2>&1

echo -e "--- Installing nodejs v8 ---"
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - >> $LOG_FILE 2>&1
apt-get install -y nodejs >> /vagrant/vm_build.log 2>&1

# curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
# echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
# apt-get update && apt-get install yarn

cd /vagrant

if [[ -s /vagrant/package.json ]] ;then
  echo "--- Installing node modules... ---"
  sudo -u vagrant -H sh -c "npm install" >> $LOG_FILE 2>&1
fi

npm link
