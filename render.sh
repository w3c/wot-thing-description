#!/bin/bash

# The parts of the TD specification encoded in RDF are rendered using STTL,
# the SPARQL Template Transformation Languge. Reference:
# 
# http://ns.inria.fr/sparql-template/
# 
# An STTL engine evaluates SPARQL queries over an RDF dataset and injects
# query results into a string template. The engine used in this script is
# STTL.js:
#
# https://github.com/vcharpenay/STTL.js/

if ! command -v node > /dev/null; then
	echo "Please install Node.js first: https://nodejs.org/."
	exit
fi

DOT_CMD="dot"

if ! command -v dot > /dev/null; then
	DOT_CMD=""
	echo "Warning: Graphviz is not installed, SVG diagrams won't be rendered."
fi

STTL_CLI="node_modules/sttl/src/cli.js"

if ! [[ -e $STTL_CLI ]]; then
	echo "Downloading rendering engine (STTL)..."
	npm i vcharpenay/STTL.js
fi

STTL_CMD="node "$STTL_CLI

# All vocabulary terms in the TD specification are defined in the JSON-LD
# context that all TD documents must reference:
# 
# context/td-context-1.1.jsonld
# 
# This file is compiled from four source context files, one for each
# vocabulary in the TD model: td (core), json-schema, wot-security, hypermedia.
# The term mappings defined in the resulting JSON-LD context are then turned
# into RDF, so that they can be given as input of the STTL template defined for
# the main specification.

echo "Pre-processing JSON-LD context..."
node context/merge.js
node context/toRDF.js -i context/td-context-1.1.jsonld -o context/td-context.ttl
echo "> context/td-context-1.1.jsonld"

# The main source for rendering is a schema specfying the shape of TD documents
# in RDF:
#
# validation/td-validation.ttl
#
# This schema is expressed in the SHACL language, the Shapes Constraint
# Language:
# 
# https://www.w3.org/TR/shacl/
# 
# SHACL defines 'node shapes' and 'property shapes', which constrain nodes and
# edges in an RDF graph. The mapping between the TD object model and SHACL is as
# follows:
#
# Class					sh:NodeShape
# Signature 			collection of sh:PropertyShape
# Assignment Function 	sh:minCount (Mandatory), sh:defaultValue (With Default)
# Type Function 		sh:node, sh:datatype (Simple Type)
# Map, Array			no sh:maxCount
# 
# Along with these SHACL shapes, we add the JSON-LD term mappings, generated in
# the previous step, to the rendering process. The following JSON-LD definitions
# are used to generate TD class signatures:
#
# Term 		jsonld:term
# Map 		jsonld:container => jsonld:index, jsonld:language
# Array 	jsonld:container => jsonld:set
#
# Finally, we add vocabulary files that include sub-class axioms (using
# the rdfs:subClassOf RDF property):
# 
# ontology/td.ttl
# ontology/jsonschema.ttl
# ontology/wotsec.ttl
# ontology/hctl.ttl

PREFIXES=("td" "hctl" "jsonschema" "wotsec")
FILES=""
for prefix in ${PREFIXES[@]}; do
	FILES=$FILES" ontology/"$prefix".ttl"
done

echo "Rendering main specification..."
$STTL_CMD -i validation/td-validation.ttl context/td-context.ttl $FILES \
          -t templates.sparql \
		  -c "http://w3c.github.io/wot-thing-description/#main" \
		  -o index.html
echo "> index.html"

# The TD specification includes diagrams that can be automatically generated
# from the same SHACL source. The diagrams are first generated in textual form
# with STTL and then turned into graphics using Graphviz:
# 
# https://graphviz.gitlab.io/

if [[ -n $DOT_CMD ]]; then
	echo "Rendering SVG diagrams..."
	for prefix in ${PREFIXES[@]}; do
		$STTL_CMD -i validation/td-validation.ttl context/td-context.ttl $FILES \
				-t visualization/templates.sparql \
				-c "http://w3c.github.io/wot-thing-description/visualization#main" $prefix \
				-o visualization/$prefix.dot
		dot -T svg -o visualization/$prefix.svg visualization/$prefix.dot
		echo "> visualization/"$prefix".svg"
	done
fi

# In addition to the main specification, the td, json-schema, wot-security and
# hypermedia vocabularies are documented in separate documents as OWL
# ontologies, so that they can independently be reused and semantically aligned
# with external vocabularies (e.g. SSN, SAREF, QUDT).  The generated ontology
# documents closer match best practices on the Semantic Web in comparison to
# the TD model specification.

echo "Rendering OWL documentation..."
for prefix in ${PREFIXES[@]}; do
	$STTL_CMD -i $FILES \
	          -t ontology/templates.sparql \
			  -c "http://w3c.github.io/wot-thing-description/ontology#main" $prefix \
			  -o ontology/$prefix.html
	echo "> ontology/"$prefix".html"
done