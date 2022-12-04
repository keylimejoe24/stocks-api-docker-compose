#!/bin/bash
rm -rf stocks-api-docker-compose
git clone https://github.com/keylimejoe24/stocks-api-docker-compose.git
cd stocks-api-docker-compose
DB_HOST=$1 docker-compose up scraping-server -d