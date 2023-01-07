#!/bin/bash

function cleanDist() {
  rm -rf services/$1/dist
}

function cleanJsFiles() {

  find packages/**/src/ -maxdepth 3 -type f -name '*.js' -delete
  find infrastructure/bin/ -maxdepth 1 -type f -name '*.js' -delete
  find infrastructure/bin/ -maxdepth 1 -type f -name '*.d.ts' -delete
  find infrastructure/lib/ -maxdepth 1 -type f -name '*.js' -delete
  find infrastructure/lib/ -maxdepth 1 -type f -name '*.d.ts' -delete
  find infrastructure/test/ -maxdepth 1 -type f -name '*.js' -delete
  find infrastructure/test/ -maxdepth 1 -type f -name '*.d.ts' -delete
}

# cleanDist Core
# cleanDist User
# cleanDist WebSockets

function build() {
   lerna run build --stream --scope=$1
}

cleanJsFiles

build @holeshot/types
build @holeshot/commands
build @holeshot/aws-commands

build @holeshot/core-service
build @holeshot/user-service
build @holeshot/aws-websockets

clean
