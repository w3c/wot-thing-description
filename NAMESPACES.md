# [Draft] Namespaces and Resources

The W3C WoT WG maintains a list of namespaces and the resources behind them in addition to the standardization documents.
This file lists them together.

For choosing new namespaces, please refer to <https://www.w3.org/2005/07/13-nsuri>

## Current State

### JSON-LD Context Files and Ontologies

| W3C URL | GitHub URL | Content Type |
| ------- | ---------- | ------------ |
| `https://www.w3.org/2019/wot/td/v1` | `http://w3c.github.io/wot-thing-description/context/td-context-1.1.jsonld` | `application/ld+json`|
| `https://www.w3.org/2019/wot/td` | `http://w3c.github.io/wot-thing-description/ontology/td.ttl` | `text/turtle` |
| `https://www.w3.org/2019/wot/td` (same as above) | `http://w3c.github.io/wot-thing-description/ontology/td.html` | `text/html` |
| `https://www.w3.org/2019/wot/json-schema` | `http://w3c.github.io/wot-thing-description/ontology/json-schema.ttl` | `text/turtle` |
| `https://www.w3.org/2019/wot/json-schema` (same as above) | `http://w3c.github.io/wot-thing-description/ontology/jsonschema.html` | `text/html`|
| `https://www.w3.org/2019/wot/security` | `http://w3c.github.io/wot-thing-description/ontology/wot-security.ttl` | `text/turtle` |
| `https://www.w3.org/2019/wot/security` (same as above) | `http://w3c.github.io/wot-thing-description/ontology/wotsec.html` | `text/html`|
| `https://www.w3.org/2019/wot/hypermedia` | `http://w3c.github.io/wot-thing-description/ontology/hypermedia.ttl` | `text/turtle`
| `https://www.w3.org/2019/wot/hypermedia` (same as above)| `http://w3c.github.io/wot-thing-description/ontology/hyperm.html` | `text/html` |
| `https://www.w3.org/2022/wot/td/v1.1` | `https://w3c.github.io/wot-thing-description/context/td-context-1.1.jsonld` | `application/ld+json`|

**Note:** The group had decided in the TD 1.1 work that the ontologies behind `https://www.w3.org/2019/wot/td`, `https://www.w3.org/2019/wot/json-schema`, `https://www.w3.org/2019/wot/security` and `https://www.w3.org/2019/wot/hypermedia` change to the 1.1 version. Thus, the same files are used for 1.0 and 1.1 ontologies.

## Desired State DRAFT

### JSON-LD Context Files and Ontologies

| W3C URL | GitHub URL | Content Type |
| ------- | ---------- | ------------ |
| `https://www.w3.org/2019/wot/td/v1` | `https://w3c.github.io/wot-thing-description/publication/rec/context/td-context-1.1.jsonld` | `application/ld+json`|
| `https://www.w3.org/2019/wot/td` | `http://w3c.github.io/wot-thing-description/ontology/td.ttl` | `text/turtle` |
| `https://www.w3.org/2019/wot/td` (same as above) | `http://w3c.github.io/wot-thing-description/ontology/td.html` | `text/html` |
| `https://www.w3.org/2019/wot/json-schema` | `http://w3c.github.io/wot-thing-description/ontology/json-schema.ttl` | `text/turtle` |
| `https://www.w3.org/2019/wot/json-schema` (same as above) | `http://w3c.github.io/wot-thing-description/ontology/jsonschema.html` | `text/html`|
| `https://www.w3.org/2019/wot/security` | `http://w3c.github.io/wot-thing-description/ontology/wot-security.ttl` | `text/turtle` |
| `https://www.w3.org/2019/wot/security` (same as above) | `http://w3c.github.io/wot-thing-description/ontology/wotsec.html` | `text/html`|
| `https://www.w3.org/2019/wot/hypermedia` | `http://w3c.github.io/wot-thing-description/ontology/hypermedia.ttl` | `text/turtle`
| `https://www.w3.org/2019/wot/hypermedia` (same as above)| `http://w3c.github.io/wot-thing-description/ontology/hyperm.html` | `text/html` |
| `https://www.w3.org/2022/wot/td/v1.1` | `https://w3c.github.io/wot-thing-description/publication/ver11/7-rec/context/td-context-1.1.jsonld` | `application/ld+json`|
| `https://www.w3.org/2022/wot/tm` (NEW) | `https://w3c.github.io/wot-thing-description/publication/ver11/7-rec/ontology/tm.ttl` | `text/turtle`|

### JSON Schemas

| W3C URL | GitHub URL | Content Type |
| ------- | ---------- | ------------ |
| `https://www.w3.org/2019/wot/td-schema/v1` (NEW) | `https://w3c.github.io/wot-thing-description/publication/rec/validation/td-json-schema-validation.json` | `application/json` |
| `https://www.w3.org/2022/wot/td-schema/v1.1` (NEW) | `https://w3c.github.io/wot-thing-description/publication/ver11/7-rec/validation/td-json-schema-validation.json` | `application/json` |
| `https://www.w3.org/2022/wot/tm-schema/v1.1` (NEW)  | `https://w3c.github.io/wot-thing-description/publication/ver11/7-rec/validation/tm-json-schema-validation.json` | `application/json` |

## Discussion so far

ek: The need to main a couple of namespaces for different purposes. This also implies the resources behind them need to be maintained and how they are linked to each too. So far, this seems to have happened in a not-so-transparent fashion where I cannot find which file in our repo a URL like https://www.w3.org/2022/wot/td/v1.1 points to. In general, we should document these since we now need URLs for TD and TM JSON Schemas, TM Ontology (see #1807) meanwhile linking to correct W3C guidelines such as https://www.w3.org/2005/07/13-nsuri to understand what URLs we should create.

ek: It seems that https://www.w3.org/2019/wot/td/v1 is not pointing to a tagged branch since it also contains the new terms we have added such as synchronous and schemaDefinitions...
It seems to point to https://github.com/w3c/wot-thing-description/blob/main/context/td-context.jsonld but that file also has the new terms. BUT it is not the same as https://github.com/w3c/wot-thing-description/blob/main/context/td-context-1.1.jsonld . The 1.1 context has additions (see https://www.diffchecker.com/imgLTu14/)
Doing a diff between the REC1.0 Context file and main branch context file shows difference (as expected): https://www.diffchecker.com/B3OLPlyr/
Edit: Looking at the headers for the 2019 context, last change date is 12 July 2023, which is the date shown on the editor's draft.

ek: The version done for 1.0 is documented at [#432 (comment)](https://github.com/w3c/wot-thing-description/issues/432#issuecomment-493326214)

---

Call of 19.07:

    @relu91 we should not use content negotiation since it is not a different representation of the same content. It would be better to keep the same URL design with the years to have consistency. For TD 2.0 we can change to /ns (@egekorkan and @ashimura agree).
    We should have resolution on how to handle URIs such as: "We agree to use URIs with date for TD 1.1 and 1.0. For TD 2.0 we will reevaluate and possibly change to using /ns approach"
    Concrete URI Mapping is being propose below as brainstorming:

Resources to have new URIs for:

    TM JSON Schema: https://github.com/w3c/wot-thing-description/blob/TD11-PR/validation/tm-json-schema-validation.json
    TD JSON Schema https://github.com/w3c/wot-thing-description/blob/TD11-PR/validation/td-json-schema-validation.json

https://www.w3.org/2022/wot/td/v1.1 and https://www.w3.org/2022/wot/tm are URIs to the context files (`https://www.w3.org/2019/wot/td/v1 for 1.0)

    https://www.w3.org/2022/wot/td-schema/v1.1
    https://www.w3.org/2022/wot/tm-schema/v1.1 tm schema (obviously 1.1)
    https://www.w3.org/2019/wot/td-schema/v1

For TD 2.0, we can do something like this:

    https://www.w3.org/ns/wot/td-schema and https://www.w3.org/ns/wot/td-context

Note: For the JSON Schemas, since we are referring to the tagged version which has a $id, we need to change that too.

---

ek: I have added the TTL endpoint for TM and also the JSON Schemas however there is a rather important problem to solve. When we are pointing to github.io links, which are synced to the master branch, the media type is automatically provided. When we want to tag a branch in GitHub, the links we can provide are raw git content (e.g. https://raw.githubusercontent.com/w3c/wot-thing-description/TD11-PR/validation/td-json-schema-validation.json). In that case, GitHub explicitly does not provide a media type. Some solutions that come to mind:

    1. Put the relevant content under the publication folder, which includes adding new documents to https://github.com/w3c/wot-thing-description/tree/main/publication/rec (TD 1.0 REC). I am not sure if this is allowed at this point but since there will be zero changes to the spec text, it might be fine. We need to of course do this for all resources in TD 1.0 and TD 1.1. This will result in URLs like https://w3c.github.io/wot-thing-description/publication/rec/index.html
    2. Generate URLs via a service like statically. Example: https://cdn.statically.io/gh/w3c/wot-thing-description/TD11-PR/validation/tm-json-schema-validation.json
    3. For TD 1.1 REC, generate a folder with all that resources (like publication) and revert all the documents to 1.0 stage. I do not like this option since that means that we cannot touch those document for all upcoming TD versions.

Ignoring the content type and serving the raw content should not be an option since (semantic web) tools depend on it afaik. My vote would be to go for option 1.
