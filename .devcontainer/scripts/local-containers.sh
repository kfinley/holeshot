#!/bin/bash

OPERATION=$1

if [ operation = '' ]; then

$OPERATION=start

fi

docker $OPERATION holeshot.sls
docker $OPERATION holeshot.web
docker $OPERATION holeshot.storybooks
