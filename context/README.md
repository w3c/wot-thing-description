# JSON-LD Contexts

This folder contains JSON-LD context files for the Thing Description (TD) repository. These contexts help in providing semantic meaning and structure to the data within Thing Descriptions, bridging the concepts of the Thing Description ontology and JSON files. The context is split in different modules:

- hypermedia-context.jsonld: Defines the concepts from the [hypermedia ontology](../ontology/hctl.ttl)
- json-schema-context.jsonld: JSON-LD context for JSON Schema used within Thing Descriptions (see [JSON Schema ontology](../ontology/json-schema.ttl)).
- td-context.jsonld: Primary JSON-LD context for Thing Descriptions with basic concepts from the [TD ontology](../ontology/td.ttl)
- wot-security-context.jsonld: JSON-LD context for security terms defined in the [WoT Security ontology](../ontology/wot-security.ttl).

Than the files are merged using the [merge.js](merge.js) script into [td-context-1.1.jsonld](td-context-1.1.jsonld) file. **Note** that 1.1 stays for the JSON-LD version used to create the file not for the Thing Description version.
