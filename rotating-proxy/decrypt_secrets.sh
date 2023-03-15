#!/bin/bash

json=$(ccdecrypt aws_secrets.json.cpt -c --key 12345678)

aws_access_key_id=$(echo $json | jq -r '.AWS_ACCESS_KEY_ID')
aws_secret_access_key=$(echo $json | jq -r '.AWS_SECRET_ACCESS_KEY')

aws --profile default configure set aws_access_key_id  $aws_access_key_id
aws --profile default configure set aws_secret_access_key $aws_secret_access_key

