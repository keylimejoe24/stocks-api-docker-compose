#!/bin/sh
echo $1 | openssl aes-256-cbc -pbkdf2 -d -a -pass pass:somepassword