#!/bin/bash

echo
echo 'Running dev initialization script...'
echo

git config --global --add safe.directory /workspace

# Open up docker socket for docker-in-docker as non-root
sudo chmod 777 /var/run/docker-host.sock

# Run pnpm install & build
if ! [ -d './node_modules' ]; then
    pnpm i

    echo
    echo 'Building serverless-offline-ses-v2 and aws-ses-v2-local'
    pnpm  --stream --filter serverless-offline-ses-v2 --filter aws-ses-v2-local run build

    echo
    echo 'Restarting containers...'
    # ensure services, sls, and vite dev client are started
    npm run containers:restart

else
    echo 'Existing repo setup... skipping pnpm install & build.'
fi

echo
if [[ $(dotnet lambda) == *'Amazon Lambda Tools for .NET Core applications'* ]]; then
  echo 'Skipping dotnet tools install...'
else
  echo 'Running dotnet tools install...'
  # Install additional .net tools (ef, lambda, etc.)
  ./.devcontainer/scripts/install-dotnet-tools.sh
fi

echo
echo -e Dev setup complete! "\xF0\x9f\x8d\xba"
