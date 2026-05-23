#!/bin/bash

export CPANEL_INSTALL_NON_INTERACTIVE=1
export CPANEL_APP_URL="https://cms.mikadee.oo.gd"
export CPANEL_DB_HOST="localhost"
export CPANEL_DB_PORT="3306"
export CPANEL_DB_NAME="beatlesb_cms"
export CPANEL_DB_USER="beatlesb_cms"
export CPANEL_DB_PASSWORD="replace-with-your-db-password"
export CPANEL_SEED=1
export CPANEL_BUILD=1

npm run install:cpanel