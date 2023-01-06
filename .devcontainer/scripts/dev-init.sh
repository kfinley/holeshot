#!/bin/bash

echo
echo 'Running dev initialization script...'
echo

git config --global --add safe.directory /workspace

# Open up docker socket for docker-in-docker as non-root
sudo chmod 777 /var/run/docker-host.sock

# Run npm & lerna installs
if ! [ -d './node_modules' ]; then
    # Do we still need these?
    # sudo apt install python2 -y
    # npm config set python python2
    npm install silent
    npm run bootstrap

    echo
    echo 'Building serverless-offline-ses-v2 and aws-ses-v2-local'
    npm run lerna -- run build --scope=serverless-offline-ses-v2 --scope=aws-ses-v2-local --stream
    
    echo
    echo 'Restarting containers...'
    # ensure services, sls, and vite dev client are started
    npm run containers:restart

else
    echo 'Existing repo setup... skipping npm & lerna setup.'
fi

echo
echo -e Dev setup complete! "\xF0\x9f\x8d\xba"
