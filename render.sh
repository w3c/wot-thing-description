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

PREFIXES=("td" "hctl" "jsonschema" "wotsec")
FILES=""
for prefix in ${PREFIXES[@]}; do
	FILES=$FILES" ontology/"$prefix".ttl"
done

echo "Pre-processing JSON-LD context..."
node context/merge.js
node context/toRDF.js -i context/td-context-1.1.jsonld -o context/td-context.ttl
echo "> context/td-context-1.1.jsonld"

echo "Rendering main specification..."
for prefix in ${PREFIXES[@]}; do
	# generate .part.html file with rendered snippet
	$STTL_CMD -i $FILES validation/td-validation.ttl context/td-context.ttl -t templates.sparql -c "http://w3c.github.io/wot-thing-description/#main" $prefix -o $prefix.part.html
	# include .part.html into .template.html to create final .html file
	# TODO
done

exit # TODO to remove when main spec rendering works

echo "Rendering SVG diagrams..."
# TODO

echo "Rendering OWL documentation..."
for prefix in ${PREFIXES[@]}; do
	# generate .part.html file with rendered snippet
	$STTL_CMD -i $FILES -t ontology/templates.sparql -c "http://w3c.github.io/wot-thing-description/ontology#main" $prefix -o ontology/$prefix.part.html
	# include .part.html into .template.html to create final .html file
	sed -e "/<\!--axioms-->/ r ontology/"$prefix".part.html" ontology/$prefix.template.html > ontology/$prefix.html
	echo "> ontology/"$prefix".html"
done