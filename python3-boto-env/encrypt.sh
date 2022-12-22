#!/bin/sh
echo $1 | openssl aes-256-cbc -a -pbkdf2 -A -salt -pass pass:somepassword