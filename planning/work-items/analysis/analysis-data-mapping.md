# Data Mapping Analysis

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/data%20mapping)

Also known as: Mapping TD elements to protocol or network messages

- Some protocols have a main channel and auxiliary/ancillary/side channels to exchange information, e.g HTTP has Headers, URI-Variables, Payload/Body.
- Some protocols may have a default/unique `contentType` for at least one of the channels, others are fixed or flexible. e.g. HTTP Headers are key-value strings, Modbus uses only boolean and 16bit quantities.
- Some protocols do not have the concept of `contentType` at all.
- Some `contentType` may be more expressive than our DataSchema, e.g. CBOR [Maps with integer keys](https://www.rfc-editor.org/rfc/rfc8949.html#map-keys).

## Open questions

- How can we describe how the logical information (state for property, input/output messages for actions, messages for event) is mapped to each channel?
- Do we need to reconsider how we express `contentType` and `contentCoding` in the case more than a channel allows flexible data formats?
- Do we want to provide a way to express a serialization scheme for protocols that have only inflexible (e.g. binary-only) channels, without going through the route of declaring a `contentType`?
- Do we want to provide a way to express a serialization scheme between our DataSchema and richer contentTypes (e.g XML, CBOR)?
- What is standardized in the TD as a core mechanism and what is left to the bindings?

## Related Issues

- TD Repository: https://github.com/w3c/wot-thing-description/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22data%20mapping%22
- Binding Templates Repository: https://github.com/w3c/wot-binding-templates/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22data%20mapping%22
  - Also not forgetting: https://github.com/w3c/wot-binding-templates/issues/302
- Others:
  - node-wot or Scripting API:
    - https://github.com/eclipse-thingweb/node-wot/issues/1221

## User Stories

1. Side Channels

- **Who:** Developer of a Consumer, TD Designer
- **What:** Want to use the DataSchema for the application relevant data even when the application relevant data does not fit into one part of the protocol message
  - HTTP [header fields](https://www.rfc-editor.org/rfc/rfc9110.html#name-header-fields)
  - [URL](https://www.rfc-editor.org/rfc/rfc3986) Query and Path
- **Why:** I can provide one abstraction over diverse protocols and constrain the mess
  - Developer of a Consumer: better abstraction to separate implementations better, easier to build web applications
  - TD Designer: Simplify the understanding of the TD

- Sentence: **As a** Developer of a Consumer, TD Designer, **I need** Want to use the DataSchema for the application relevant data even when the application relevant data does not fit into one part of the protocol message, **so that I can** provide one abstraction over diverse protocols and constrain the mess.
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Luca Barbato, the WoT TD TF for TD 1.1 uriVariables support
  - Implementation Volunteers: Luca Barbato
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: Have a clear way to support protocols and device types that are hard or impossible to describe nowadays
- Linked Use Cases or Categories: TBD
- Relevant issues:
  - https://github.com/w3c/wot-binding-templates/issues/302
  - HTTP offers a specific way to extend the information provided and URL can be used to encode further information.
  - BACnet binding requires 3 URI variables to give the possibility to provide additional parameters: https://w3c.github.io/wot-binding-templates/bindings/protocols/bacnet/#vocabulary-uri-variables

2. XML data exchange

- **Who:** TD designer of a Thing with XML data exchange.
- **What:** Want to describe XML payloads in TDs (TD uses JSON Schema to describe payload data) and automatically validate XML payloads (WoT implementations use JSON Schema to validate payload data)
  - Impossible to describe XML data accurately (i.e., there is no 1:1 mapping between JSON schema and XML schema)
  - XML and/or JSON in memory while data on the wire (mapping between JSON and XML)
- **Why:** So I can include Things (including in existing solutions) that use XML as payload content type in the WoT

- Sentence: **As a** developer, **I need** to support data exchange other than JSON (e.g., XML).
- Process Stakeholders:
  - Submitter: Daniel Peintner
  - Specification Writers: Daniel Peintner
  - Implementation Volunteers: Daniel Peintner
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: Have a **standardized** way to describe XML data in TDs which increases addressable Things without impacting existing implementations
- Linked Use Cases or Categories: TBD
- Relevant issues:
  - https://github.com/w3c/wot-binding-templates/issues/139

## Existing Solutions

- OpenAPI 3.2 with XML Payload Description: https://github.com/OAI/OpenAPI-Specification/pull/4592

## Summarized Problem

Will be done after collecting the user stories and all related issues

## Requirements

Will be done after everything else
