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
- **What:** Want to use the DataSchema for the application-relevant data even when the application-relevant data does not fit into one part of the protocol message
  - HTTP [header fields](https://www.rfc-editor.org/rfc/rfc9110.html#name-header-fields)
  - [URL](https://www.rfc-editor.org/rfc/rfc3986) Query and Path
- **Why:** I can provide one abstraction over diverse protocols and constrain the mess

  - Developer of a Consumer: better abstraction to separate implementations better, easier to build web applications
  - TD Designer: Simplify the understanding of the TD

- Sentence: **As a** Developer of a Consumer, TD Designer, **I need** to use the DataSchema for the application relevant data even when the application relevant data does not fit into one part of the protocol message, **so that I can** provide one abstraction over diverse protocols and constrain the mess.
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Luca Barbato, the WoT TD TF for TD 1.1 uriVariables support
  - Implementation Volunteers: Luca Barbato
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: Have a clear way to support protocols and device types that are hard or impossible to describe nowadays
- Linked Use Cases or Categories: TBD
- Relevant issues:
  - URI Variable for BACnet: https://github.com/w3c/wot-binding-templates/issues/302
  - HTTP offers a specific way to extend the information provided, and a URL can be used to encode further information.
  - BACnet binding requires 3 URI variables to give the possibility to provide additional parameters: https://w3c.github.io/wot-binding-templates/bindings/protocols/bacnet/#vocabulary-uri-variables
  - MQTT attributes
  - ? CoAP headers to be checked

2. Mapping to non-JSON Payloads

Note: this includes plain text, xml etc. but not image and video formats, not binary data like modbus data
Note 2: Adapt it to bring nuance on the complexity of the payload format. XML has more "features" that JSON, CSV has other concepts.
Note 3: For the potential solution, we want the transformation to JSON Schema understandable format for the implementer to understand.
Note 4: Do we prescribe a transformation, CSVs must look like `[[col1value, col2value, ...],[col1value, col2value, ...]]` or `[ {col1Name:col1Value}, {col2Name:col2Value}` or do we let the TD desinger choose or we let the consumer application choose, thus no need transform but give meaning of the columns.

- **Who:** TD designer of a Thing with non-JSON data exchange such as XML.
- **What:** Describe XML payloads in TDs (TD uses JSON Schema to describe payload data) and automatically validate XML payloads (WoT implementations use JSON Schema to validate payload data)
  - Impossible to describe XML data accurately (i.e., there is no 1:1 mapping between JSON schema and XML schema)
  - XML and/or JSON in memory while data on the wire (mapping between JSON and XML)
- **Why:** So I can include Things (including in existing solutions) that use XML as payload content type in the WoT

- Sentence: **As a** developer, **I need** to support data exchange other than JSON (e.g., XML).
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Daniel Peintner
  - Implementation Volunteers: Daniel Peintner
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: Have a standardized way to describe XML data in TDs which increases addressable Things without impacting existing implementations
- Linked Use Cases or Categories: TBD
- Relevant issues:
  - XML template is more for green field devices: https://github.com/w3c/wot-binding-templates/issues/139
- Existing Solutions:
  - OpenAPI 3.2 with XML Payload Description: https://github.com/OAI/OpenAPI-Specification/pull/4592

1. Basic Mathematical Operations

- **Who:** Developer of a Consumer, TD Designer
- **What:** Express the need to apply mathematical operations to the data received or to be sent as a protocol message
- **Why:** Guarantee that the data fits to the protocol message while staying easy to understand for the application

- Sentence: **As a** Developer of a Consumer, TD Designer, **I need** to express the need to apply mathematical operations to the data received or to be sent as a protocol message, **so that I can** guarantee that the data fits to the protocol message while staying easy to understand for the application.
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Multiple
  - Implementation Volunteers: ?
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: More use cases covered without protocol-specific vocabularies
- Linked Use Cases or Categories: TBD
- Relevant issues:
  - Extending Data Mapping Examples: https://github.com/w3c/wot-thing-description/issues/2034#issuecomment-4260667948
  - Basic Operations on Data: https://github.com/w3c/wot-thing-description/issues/2169
  - Should it be possible to indicate whether writing a property returns set value?: https://github.com/w3c/wot-thing-description/issues/875
- Existing Solutions:
  - Lorawan Binding: https://github.com/w3c/wot-binding-templates/pull/458 (`lorav:multiplier`)

4. Type Conversion (enum mapping)

- **Who:** TD Designer
- **What:** Express that a single value in Data Schema converts to another simple value in the protocol message
- **Why:** Provide easier to understand data schemas

- Sentence: **As a** TD Designer, **I need** express that a single value in Data Schema converts to another simple value in the protocol message, **so that I can** Provide easier to understand data schemas.
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Multiple
  - Implementation Volunteers: ?
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: More use cases covered without protocol-specific vocabularies
- Linked Use Cases or Categories: TBD
- Relevant issues:
  - Modeling enumeration values semantically: https://github.com/w3c/wot-thing-description/issues/997 (main issue)
  - Supporting complex/structured types in simple protocols: https://github.com/w3c/wot-thing-description/issues/1936
  - Supporting bitmaps : https://github.com/w3c/wot-thing-description/issues/1930
- Existing Solutions:
  - BACnet Binding: https://w3c.github.io/wot-binding-templates/bindings/protocols/bacnet/#example-enum-mapping (`bacv:hasValueMap`)
  - Profinet https://w3c.github.io/wot-binding-templates/bindings/protocols/profinet/#example-complex-datatype (`profv:enumeratedValue`)

5. Structured and Simple Data Mismatch (value wrapping, bitmasking)

- **Who:** TD Designer
- **What:** Express conversion between data structures
- **Why:** Allow Data Schema abstraction to be used on more complex data structures of the protocol message or on more simple protocol message structures

- Sentence: **As a** TD Designer, **I need** express conversion between data structures, **so that I can** allow Data Schema abstraction to be used on more complex data structures of the protocol message or on more simple protocol message structures.
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Multiple
  - Implementation Volunteers: node-wot
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: More use cases covered without protocol-specific vocabularies
- Linked Use Cases or Categories: TBD
- Relevant issues:
  - Supporting complex/structured types in simple protocols: https://github.com/w3c/wot-thing-description/issues/1936
  - Supporting bitmaps : https://github.com/w3c/wot-thing-description/issues/1930#issuecomment-4342467719
- Existing Solutions:
  - Data Mapping in node-wot to choose a part of the JSON Payload: https://github.com/eclipse-thingweb/node-wot#data-mapping-per-thing
  - Profinet https://w3c.github.io/wot-binding-templates/bindings/protocols/profinet/#example-complex-datatype (`profv:payloadMapping`)
- Notes:
  - This does NOT include mathematical operations, that is above above point 3
  - This does NOT restrict itself to simple type conversion, that is above point 4. However, this can be applied on top of point 4.

6. More Detailed Types

How to model it in JSON but also giving hints so that the drivers can use it.

- **Who:** TD Consumer
- **What:** understand more detailed data types without looking into binding specifications
- **Why:** reduce implementation effort per protocol

- Sentence: **As a** TD Consumer, **I need** understand more detailed data types without looking into binding specifications, **so that I can** reduce implementation effort per protocol.
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Multiple
  - Implementation Volunteers: ?
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: More use cases covered without protocol-specific vocabularies
- Linked Use Cases or Categories: TBD
- Relevant issues:
  - ?
- Existing Solutions:
  - Modbus: https://w3c.github.io/wot-binding-templates/bindings/protocols/modbus/#payloaddatatype
  - BACnet: https://w3c.github.io/wot-binding-templates/bindings/protocols/bacnet/#datatype-mappings
  - Profinet: https://w3c.github.io/wot-binding-templates/bindings/protocols/profinet/#payloaddatatype
  - LoRaWan: Once PR is merged.

## Existing Solutions

## Summarized Problem

Will be done after collecting the user stories and all related issues

## Requirements

Will be done after everything else
