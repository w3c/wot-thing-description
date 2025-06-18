# Data Mapping Analysis

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/data%20mapping)

Also known as: Mapping TD elements to messages

- Some protocols have a main channel and auxiliary/ancillary/side channels to exchange information, e.g HTTP has Headers, URI-Variables, Payload/Body.
- Some protocols may have a default/unique `contentType` for at least one of the channels, others are fixed or flexible. e.g. HTTP Headers are key-value strings, Modbus uses only boolean and 16bit quantities.
- Some protocols do not have the concept of `contentType` at all.
- Some `contentType` may be more expressive than our DataSchema, e.g. CBOR [Maps with integer keys](https://www.rfc-editor.org/rfc/rfc8949.html#map-keys).

## Open questions

- How can we describe how the logical information (state for property, input/output messages for actions, messages for event) is mapped to each channel?
- Do we need to reconsider how we express `contentType` and `contentCoding` in the case more than a channel allows flexible data formats?
- Do we want to provide a way to express a serialization scheme for protocols that have only inflexible (e.g. binary-only) channels, without going through the route of declaring a `contentType`?
- Do we want to provide a way to express a serialization scheme between our DataSchema and richer contentTypes (e.g XML, CBOR)?

## Related Issues:

- [BACnet URI Variables discussion](https://github.com/w3c/wot-binding-templates/issues/302)
- [Complex data types in simple protocols](https://github.com/w3c/wot-thing-description/issues/1936)
- [jsonrpc-over-websocket](https://github.com/w3c/wot-binding-templates/issues/125)
- [xml binding discussion](https://github.com/w3c/wot-binding-templates/issues/139)
- [cbor analysis](https://github.com/w3c/wot-binding-templates/issues/8)
- [initial issue with this](https://github.com/w3c/wot-binding-templates/issues/219)
- [aka payload pattern](https://github.com/w3c/wot-thing-description/issues/1217)
- [HTTP Headers in directory exploration (Problem 2)](https://github.com/eclipse-thingweb/node-wot/issues/1221)

## User Stories

1. HTTP side channels

- **Who:** Developer of a Consumer
- **What:** How to lay out affordances to deliver some of the DataSchemas described when it does not fit the [Content](https://www.rfc-editor.org/rfc/rfc9110.html#name-content)
  - HTTP [header fields](https://www.rfc-editor.org/rfc/rfc9110.html#name-header-fields)
  - [URL](https://www.rfc-editor.org/rfc/rfc3986) Query and Path
- **Why:** Sometimes the request body does not contain all the information to deliver, HTTP offers a specific way to extend the information provided and URL can be used to encode further information.

- Sentence: **As a** developer, **I need** support an implementation that encodes part of the DataSchema either in the URL itself or in the HTTP Headers, **so that I can** interoperate with services expecting such patterns.
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Luca Barbato, the WoT TD TF for TD 1.1 urlVariables support
  - Implementation Volunteers: Luca Barbato
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: Have a clear way to support services that are hard or impossible to describe nowadays
- Linked Use Cases or Categories: TBD

2. XML data exchange

- **Who:** Developer with XML data exchange (instead of JSON). In general, any other data format which differs from JSON.
- **What:** Want to describe XML payloads in TDs (TD uses JSON Schema to describe payload data) and automatically validate XML payloads (WoT implementations use JSON Schema to validate payload data)
  - Impossible to describe XML data accurately (i.e., there is no 1:1 mapping between JSON schema and XML schema)
  - XML and/or JSON in memory while data on the wire (mapping between JSON and XML)
  - See discussions in https://github.com/w3c/wot-binding-templates/issues/139
- **Why:** Include Things (including in existing solutions) that use XML as payload content type in the WoT

- Sentence: **As a** developer, **I need** to support data exchange other than JSON (e.g., XML).
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Daniel Peintner
  - Implementation Volunteers: Daniel Peintner
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: Have a **standardized** way to describe XML data in TDs
- Linked Use Cases or Categories: TBD

## Existing Solutions

TBD

## Summarized Problem

Will be done after collecting the user stories and all related issues

## Requirements

Will be done after everything else
