#!/bin/bash
export TERM=xterm
cd /var/www/html/relist-car
git pull origin main
git status
npm install
pm2 restart relist-car
