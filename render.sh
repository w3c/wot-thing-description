#!/bin/bash

if ! command -v node > /dev/null; then
	echo "Please install Node.js first: https://nodejs.org/."
	exit
fi

STTL_CLI="node_modules/sttl/src/cli.js"

if ! [[ -e $STTL_CLI ]]; then
	echo "Downloading rendering engine (STTL)..."
	npm i vcharpenay/STTL.js
fi

STTL_CMD="node "$STTL_CLI

echo "Rendering main specification..."
# TODO

PREFIXES=("td" "hctl" "jsonschema" "wotsec")
FILES=""
for prefix in ${PREFIXES[@]}; do
	FILES=$FILES" ontology/"$prefix".ttl"
done

echo "Rendering OWL documentation..."
for prefix in ${PREFIXES[@]}; do
	# generate .part.html file with rendered snippet
	$STTL_CMD -i $FILES -t ontology/templates.sparql -c "http://w3c.github.io/wot-thing-description/ontology#main" $prefix -o ontology/$prefix.part.html
	# include .part.html into .template.html to create final .html file
	sed -e "/<\!--axioms-->/ r ontology/"$prefix".part.html" ontology/$prefix.template.html > ontology/$prefix.html
	echo "> ontology/"$prefix".html"
done