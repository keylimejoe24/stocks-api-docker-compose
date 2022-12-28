#!/bin/bash
DB_HOST=$1 docker-compose build --build-arg ACCESS_KEY=$2 --build-arg SECRET_ACCESS_KEY=$3 --build-arg MASTER_IP=$1
docker push joja5627/node-server:latest
# docker push joja5627/frontend:latest
docker push joja5627/boto3-flask:latest


