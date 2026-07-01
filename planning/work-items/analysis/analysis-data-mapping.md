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

3. Basic Mathematical Operations

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

4. Simple Type Conversion (enum mapping)

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

## Summarized Challenges

### CSV Handling

The discussion shows that CSV support is not only a "non-JSON payload" question, but a mapping question between tabular wire data and TD DataSchema semantics.

#### Explanation: Tabular Wire Data vs TD DataSchema Semantics

"Tabular wire data" means the raw CSV exchanged over the protocol, where meaning is often implied by row and column position, header names, formatting rules, and context.

"TD DataSchema semantics" means the meaning that a WoT Consumer expects from TD data models, such as explicit property names, types, constraints, and structure.

So the challenge is not only to parse CSV syntax, but to define how each CSV column/row maps to TD-level meaning. For example, a CSV line like `t,unit,v` -> `1718894400,C,23.4` needs a mapping that says which field is the timestamp, which is the unit, which is the measured value, and what their expected data types and constraints are.

Without this mapping layer, two implementations can read the same CSV bytes but derive different JSON structures or interpretations, which harms interoperability.

- In issue #2094, the group set up this analysis document as the place to collect concrete examples and user stories first, while deferring final summary and requirements until enough evidence is gathered.
- In PR #2201, participants explicitly raised W3C CSV-related resources, especially `https://www.w3.org/ns/csvw` and the Metadata Vocabulary for Tabular Data recommendation, as relevant prior art.
- A key takeaway from the PR discussion is that CSVW can be a useful starting point to describe CSV structure and metadata, but it is not automatically a complete fit for WoT TD needs; it should be used carefully.
- The proposed direction in the discussion is layered: reuse CSV metadata concepts to describe table shape (columns, names, structure), then define WoT-specific mapping terms to connect CSV values to TD DataSchema.

The unresolved challenge for CSV is therefore: how to standardize a predictable mapping from CSV to the JSON-Schema-like data model used by TDs without over-constraining implementations. This includes deciding whether TD should prescribe one canonical JSON representation of CSV rows (e.g., arrays vs. objects), allow multiple representations with explicit mapping metadata, and clarify what is core TD behavior versus binding-specific behavior.

#### Explanation: Canonical vs Multiple Representations and Scope Boundaries

This challenge combines three decisions that directly affect interoperability and implementation effort:

1. Canonical JSON representation or not

- If TD defines one canonical representation (for example, each CSV row must become an object keyed by column names), consumers are simpler and more interoperable.
- The downside is reduced flexibility for constrained systems or existing deployments that naturally work better with array-based rows.

2. Multiple JSON representations with explicit mapping metadata

- If TD allows multiple representations (for example, row-as-array and row-as-object), TDs need explicit metadata that tells consumers exactly how to interpret rows, headers, ordering, null handling, and type coercion.
- This preserves flexibility and backward compatibility, but raises complexity because consumers must implement more mapping logic.

3. Core TD behavior vs binding-specific behavior

- Core TD should define the minimum semantics needed for cross-protocol interoperability (for example, how mapped values relate to DataSchema constraints and names).
- Binding-specific vocabularies can define protocol or ecosystem details (for example, CSV dialect details or transport-specific defaults) that should not be mandatory for all TD implementations.

In short, the specification needs a balance: enough common rules to ensure portable semantics across implementations, while still allowing profile or binding extensions for protocol-specific needs.

#### Example Device: Campbell Scientific CR1000 and TOA5

The Campbell Scientific CR1000 (and related data logger workflows) is a useful real-world example for this challenge. Campbell documentation states that the default CR1000 output format is TOA5 (Table Output ASCII, version 5).

For CSV handling analysis, TOA5 is relevant because it is tabular text data that typically includes:

- table-oriented metadata/header lines (for example, table or schema context),
- a field-name row,
- data records as delimited values.

This creates the exact mapping problem discussed above: a TD consumer must interpret not only the row values, but also the structural meaning conveyed by TOA5 headers and column conventions. In practice, interoperability depends on clear mapping rules for column identity, data types, timestamp semantics, units, missing values, and whether mapped JSON is represented as arrays or objects.

As a result, CR1000 TOA5 is a strong candidate to exercise CSV data mapping decisions before defining normative TD requirements.

#### Exercise 1: Illustrating Tabular Wire Data vs TD DataSchema Semantics

Using the CR1000 example, consider the following simplified TOA5-style payload:

```csv
"TOA5","CR1000","CR1000","12345","CR1000.Std.32.07","CPU:weather.CR1X","1234","Weather"
"TIMESTAMP","RECORD","AirTemp_C","RH","WindSpeed_ms"
"TS","RN","Deg C","%","m/s"
"","","Avg","Avg","Avg"
"2026-06-25 10:00:00",1,23.4,56.2,4.8
```

At the wire level, this is only a sequence of delimited rows. Some rows contain metadata about the table, some define column names, some define units or aggregation semantics, and only the last row contains the actual observation values.

From a TD DataSchema perspective, however, a consumer would typically want a semantic structure closer to:

```json
{
  "timestamp": "2026-06-25T10:00:00Z",
  "airTemperature": {
    "value": 23.4,
    "unit": "Cel",
    "type": "number"
  },
  "relativeHumidity": {
    "value": 56.2,
    "unit": "percent",
    "type": "number"
  },
  "windSpeed": {
    "value": 4.8,
    "unit": "m/s",
    "type": "number"
  }
}
```

This gap illustrates the problem. The wire data does not directly say that `AirTemp_C` should map to a TD property called `airTemperature`, that `Deg C` should be interpreted as a semantic unit, that `Avg` qualifies the value as an average, or that `TIMESTAMP` should be normalized into a TD-friendly date-time representation. Those semantics must either be inferred by convention or declared explicitly in mapping metadata.

The exercise therefore shows that CSV handling is not only about parsing rows and columns. It is about identifying which rows carry schema information, which cells carry data values, and how both are mapped into the logical data model exposed by the TD.

#### Exercise 2: Canonical Representation Decision (Row-as-Array vs Row-as-Object)

Using the same CR1000 TOA5-style data row:

```csv
"2026-06-25 10:00:00",1,23.4,56.2,4.8
```

two valid JSON mappings are possible.

Option A (row-as-array):

```json
[
  "2026-06-25 10:00:00",
  1,
  23.4,
  56.2,
  4.8
]
```

Option B (row-as-object):

```json
{
  "TIMESTAMP": "2026-06-25 10:00:00",
  "RECORD": 1,
  "AirTemp_C": 23.4,
  "RH": 56.2,
  "WindSpeed_ms": 4.8
}
```

Both are syntactically correct and both can be transformed into a TD-level model. However, they have different trade-offs:

- Array form is compact, but depends on fixed column order and external knowledge of index-to-meaning mapping.
- Object form is self-descriptive, but depends on stable field names and clear normalization rules.

To avoid ambiguity across implementations, mapping metadata must make the representation explicit. At minimum, the mapping needs to state:

- which representation is used (`array` or `object`),
- how columns are ordered or named,
- how types are coerced,
- how units and qualifiers (for example `Avg`) are attached,
- how timestamps are normalized.

This exercise illustrates why the specification needs either one canonical mapping profile or a small set of allowed mappings with mandatory metadata. Without that, two conforming consumers can parse the same CSV payload and still produce incompatible semantic results.

#### Exercise 3: Type Coercion and Missing-Value Handling

Using CR1000-like rows, assume the following payload fragment:

```csv
"TIMESTAMP","RECORD","AirTemp_C","RH","WindSpeed_ms"
"TS","RN","Deg C","%","m/s"
"2026-06-25 10:05:00",2,"23.7","NAN",""
```

Even with column names known, multiple interpretation choices remain:

- `"23.7"` may be treated as a string or coerced to a numeric value.
- `"NAN"` may be interpreted as a valid string token, IEEE NaN, null, or a data-quality error.
- `""` (empty field) may mean null, not observed, sensor offline, or default value.

If these choices are not standardized, implementations diverge. For example, one consumer may produce:

```json
{
  "airTemperature": 23.7,
  "relativeHumidity": null,
  "windSpeed": null
}
```

while another may keep raw tokens:

```json
{
  "airTemperature": "23.7",
  "relativeHumidity": "NAN",
  "windSpeed": ""
}
```

To preserve interoperability, mapping metadata (or a canonical profile) should define at least:

- field-level target type (string, number, integer, boolean),
- coercion rules (for example, parse decimal strings as numbers),
- recognized missing/sentinel tokens (`""`, `"NAN"`, `"-9999"`, etc.),
- nullability and validation behavior when coercion fails,
- optional quality flags when values are imputed or marked invalid.

This exercise highlights that CSV-to-TD mapping is not only structural. It also requires deterministic semantic rules for value normalization, especially for partial, noisy, or legacy telemetry data.

#### Exercise 4: Header and Metadata Line Classification

Using a TOA5-style fragment:

```csv
"TOA5","CR1000","CR1000","12345","CR1000.Std.32.07","CPU:weather.CR1X","1234","Weather"
"TIMESTAMP","RECORD","AirTemp_C","RH","WindSpeed_ms"
"TS","RN","Deg C","%","m/s"
"","","Avg","Avg","Avg"
"2026-06-25 10:00:00",1,23.4,56.2,4.8
```

the first four lines are not equivalent. They contain different kinds of metadata:

- logger/table context,
- field identifiers,
- engineering units,
- aggregation qualifiers.

If an implementation misclassifies any of these lines as data records, the TD mapping may become corrupted (for example, trying to parse `"Deg C"` as a numeric measurement).

To make behavior deterministic, the mapping profile should define:

- which rows are metadata and which rows are observations,
- whether metadata is fixed-position, pattern-based, or explicitly declared,
- how repeated headers or table restarts are handled,
- whether metadata lines are preserved as provenance/annotations.

This exercise shows that CSV interoperability depends on row-role classification before value mapping begins.

#### Exercise 5: Time Semantics and Normalization

Using a row with timestamp but no explicit timezone:

```csv
"2026-10-25 01:30:00",1201,12.1,84.0,1.2
```

two consumers may normalize the same value differently:

- Consumer A assumes UTC -> `2026-10-25T01:30:00Z`
- Consumer B assumes local station time with daylight-saving context -> `2026-10-25T01:30:00+02:00` (or `+01:00`)

Both normalizations are plausible, but they represent different instants. That can break downstream correlation, event ordering, historical queries, and threshold analytics in WoT consumers.

To avoid this ambiguity, mapping metadata should define at least:

- source timezone policy (fixed timezone, UTC, or per-station configuration),
- daylight-saving handling rules,
- timestamp format grammar and precision,
- normalization target (for example, always RFC 3339 UTC in TD-facing payloads),
- behavior for invalid or ambiguous local times.

This exercise demonstrates that time handling is a core semantic mapping concern, not only a formatting concern.

#### Exercise 7: Quality and Status Side-Channel Mapping

Assume the payload includes quality/status columns next to measurements:

```csv
"TIMESTAMP","AirTemp_C","AirTemp_QC","RH","RH_QC"
"2026-06-25 10:10:00",23.9,"G",55.8,"SUSPECT"
```

The mapping challenge is deciding where quality semantics live in the TD-facing model. At least three choices are common:

- embed quality with each value,
- publish quality in a parallel structure,
- expose quality via separate affordances.

If implementations choose different patterns without explicit mapping metadata, applications cannot consume quality information consistently.

A deterministic mapping should define:

- accepted quality vocabulary (for example `G`, `BAD`, `SUSPECT`),
- how quality links to each measured field,
- whether low-quality values are filtered, flagged, or still delivered,
- how quality affects validation and downstream automation.

This exercise shows that CSV mapping may need to combine payload value channels with semantic quality channels.

#### Exercise 8: Multi-Table and Multi-Measurement Routing

Assume one export stream carries rows from different logical tables:

```csv
"TABLE","TIMESTAMP","RECORD","AirTemp_C","RH","Battery_V"
"Weather","2026-06-25 10:15:00",15,24.1,54.9,
"Power","2026-06-25 10:15:00",99,,,12.4
```

The challenge is routing rows to the correct TD model elements:

- `Weather` row -> environmental property/event model,
- `Power` row -> device-health property model.

Without explicit routing rules, consumers may attempt to coerce sparse columns into one schema, causing invalid or misleading payloads.

A robust mapping should define:

- table discriminator field(s),
- per-table target affordance (property/action/event data model),
- per-table schema and required fields,
- behavior for unknown tables or partially populated rows.

This exercise demonstrates that table-level routing is a first-class mapping concern, not a post-processing detail.

#### Exercise 9: CSV Dialect and Locale Variability

Assume different producers emit equivalent data using different dialects:

```csv
# dialect A
"2026-06-25 10:20:00",24.3,53.1

# dialect B
"2026-06-25 10:20:00";"24,3";"53,1"
```

Both can represent the same observation, but delimiter and decimal conventions differ. If dialect is inferred incorrectly, values may be split or parsed incorrectly (for example `24,3` as string or two columns).

Mapping metadata should declare at least:

- delimiter, quote, and escape characters,
- decimal and thousands separators,
- header presence and encoding,
- whitespace and line-ending normalization.

This exercise shows that semantic interoperability depends on syntactic dialect declarations before any TD schema mapping can be trusted.

#### Exercise 10: Error Handling and Validation Outcomes

Assume a row violates expected numeric constraints:

```csv
"TIMESTAMP","AirTemp_C","RH"
"2026-06-25 10:25:00","ERR",140
```

Here `AirTemp_C` is non-numeric and `RH` is out of range. Different consumers may:

- reject the entire row,
- keep valid fields and null invalid ones,
- preserve raw tokens with error annotations.

All approaches are reasonable, but interoperability requires one declared policy (or a bounded set of policies) so downstream systems know what guarantees they receive.

The mapping specification should define:

- row-level vs field-level rejection behavior,
- required error annotations and diagnostics,
- whether raw source tokens are retained,
- retry, quarantine, or dead-letter behavior for repeated failures.

This exercise highlights that validation is part of semantic mapping behavior, not only implementation-specific error handling.

## Requirements

Will be done after everything else
