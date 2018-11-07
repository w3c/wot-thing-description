#!/bin/bash

if ! [[ -e .install/fuseki.jar ]] ; then
	mkdir .install
	echo "Downloading RDF store (Apache Fuseki server)..."
	curl http://repo1.maven.org/maven2/org/apache/jena/jena-fuseki-server/3.9.0/jena-fuseki-server-3.9.0.jar -o .install/fuseki.jar
fi

echo "Starting RDF store (running on port 3030)..."
java -jar .install/fuseki.jar --mem /temp &
WOT_FUSEKI_PID=$! # PID of the last detached process (fuseki)
export WOT_SPARQL_ENDPOINT=http://localhost:3030/temp
export WOT_SPARUL_ENDPOINT=http://localhost:3030/temp
sleep 5 # waiting for the RDF store to initialize

echo "Rendering HTML documents & DOT diagrams..."
cd visualization
node transform.js

echo "Shutting down RDF store..."
kill ${WOT_FUSEKI_PID}
cd ..