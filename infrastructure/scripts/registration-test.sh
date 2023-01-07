#!/bin/bash

# echo '{"firstName": "k", "lastName": "f", "email": "'$1'@f.co"}'

# data_and_url='{"firstName": "k", "lastName": "f", "email": "'$1'@f.co"} http://holeshot.sls:3000/user/register'

# echo $data_and_url

# curl -X POST -H "Content-Type: application/json" -d $data_and_url
data=''"'"'{"firstName": "'$1'", "lastName": "'$2'", "email": "'$1'@'$2'.co"}'"'"''

curl_command="curl -X POST -H 'Content-Type: application/json' -d $data http://holeshot.sls:3000/user/register"

echo $curl_command
eval $curl_command
