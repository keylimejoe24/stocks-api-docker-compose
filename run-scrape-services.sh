#!/bin/bash
DB_HOST=$1 docker-compose up scraping-server --build -d

 # DB_HOST=11111 docker-compose up scraping-server --build -d & exit".format(instances[0].public_ip_address)
    # "docker-compose up mongodb prometheus grafana algorithms-server --build -d &>/dev/null"