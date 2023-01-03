#!/bin/bash
docker-compose build --build-arg MASTER_IP=$1 --build-arg ACCESS_KEY=$2 --build-arg SECRET_ACCESS_KEY=$3 --build-arg DEPLOYMENT_VERSION=$4
# docker push joja5627/node-server:latest
# docker push joja5627/frontend:latest
docker push joja5627/boto3-flask:latest

