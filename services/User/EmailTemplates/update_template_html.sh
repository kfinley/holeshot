#!/bin/bash

# TODO: move this to infrastructure/scripts once we have more templates...

jq --arg text "$(<$1.html)" '.HtmlPart=$text' $1Template.json >temp_$1
jq --arg text "$(<$1.html)" '.Body.Html.Data=$text' $1Template.json >temp_$1

mv $1Template.json $1Template.bak
mv temp_$1 $1Template.json
cp $1Template.json ../../../email-templates/$1.json
rm $1Template.bak

