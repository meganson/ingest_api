#!/bin/sh

HOME=/opt/pm2
export HOME
/usr/local/bin/npm i /opt/m_ingest_api
/usr/local/bin/pm2 kill
/usr/local/bin/pm2 start /opt/m_ingest_api/app.js --name ingest_api -- -c dev
