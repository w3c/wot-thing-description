# Data Mapping User Story 5 - Structured and Simple Data Mismatch - Summary

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
  - This does NOT include mathematical operations, that is user story 3
  - This does NOT restrict itself to simple type conversion, that is user story 4. However, this can be applied on top of user story 4.

---

## User Story Summary

**Problem:** The structure of a protocol payload does not match the structure of the application-facing DataSchema. Examples include a value nested inside an envelope, an application value that must be inserted into a nested wire object, an array element that must be selected, and several logical flags packed into one integer bitfield.

**Proposed solution:** A declarative, direction-explicit structural conversion pipeline attached at form level. The pipeline uses simple deterministic operators for path selection, placement, wrapping, array access, and bitfield conversion. It can be composed with the numeric operations of user story 3 and the enum operations of user story 4.

**Candidate operations by layer:**
- JSON payload binding (`jsonv`): `pick`, `place`, `wrap`, `unwrap`, `at`, and `setAt` operate on decoded JSON object/array trees.
- Octet-stream payload binding (`octv`): `bitExtract` and `bitCompose` operate on an integer after the binding has decoded the relevant bytes.
- Shared mapping core: `record` applies named field pipelines to each element of an already-decoded array and returns application-facing records. It is a collection operation described in [US2345-summary.md](./US2345-summary.md), not a JSON or CSV parser and not a US5 structural operator.

**Key design decisions:**
- Direction is explicit per form: `map:fromWire` for protocol-to-application and `map:toWire` for application-to-protocol.
- Operations are applied in document order and each operation receives the previous operation's output.
- `record` applies nested ordered field pipelines independently to every input row and returns an array of records.
- JSON payload paths use JSON Pointer as described by the `jsonv` binding; they address object members and array indexes without query, filter, wildcard, or expression semantics.
- Missing-path behavior is explicit and defaults to `error`.
- Bitfield masks must be non-zero and non-overlapping; shifts must be non-negative.
- A write path must be declared or derivable without ambiguity. Lossy structural reductions are read-only unless reconstruction is explicitly defined.

## Vocabulary Allocation and Contexts

The former draft treated pipeline control, JSON-tree navigation, and bitfield layout as one `map` vocabulary. These are separate concerns. The working `map` core is format-neutral and is intended to be incorporated into the WoT TD core context in the future; JSON and octet-stream payload bindings retain their own contexts because their terms depend on a payload representation.

### `map` core context

```json
{
  "@context": {
    "map": "https://www.w3.org/wot/data-mapping/v1#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "valueMapping": { "@id": "map:valueMapping", "@type": "@json" },
    "fromWire": { "@id": "map:fromWire", "@container": "@list" },
    "toWire": { "@id": "map:toWire", "@container": "@list" },
    "op": { "@id": "map:proc", "@type": "xsd:string" },
    "onError": { "@id": "map:onError", "@type": "xsd:string" },
    "fields": { "@id": "map:fields", "@type": "@json" },
    "value": { "@id": "map:value", "@type": "xsd:decimal" },
    "mode": { "@id": "map:mode", "@type": "xsd:string" },
    "min": { "@id": "map:min", "@type": "xsd:decimal" },
    "max": { "@id": "map:max", "@type": "xsd:decimal" },
    "onNoMatch": { "@id": "map:onNoMatch", "@type": "xsd:string" },
    "mapEntries": { "@id": "map:map", "@container": "@list" },
    "wire": "map:wire",
    "app": "map:app",
    "ranges": { "@id": "map:ranges", "@container": "@list" },
    "canonical": "map:canonical"
  }
}
```

`map` owns ordered read/write pipelines and operations that do not depend on the payload syntax: `mul`, `add`, `reciprocal`, `round`, `clamp`, `enum`, and `enumRange`. Its generic `map:proc` dispatches binding operations only after their binding has decoded the payload.

The format-neutral `record` operation is also part of the shared mapping
pipeline. It takes an array of already-decoded values, applies the named
`map:fields` pipelines to each element, and returns an array of application
records. It does not parse CSV, classify rows, or choose array versus object row
representation; those are payload-binding responsibilities. A nested field
pipeline may use a binding operation such as `jsonv` path selection when its
input is an object. The current node-wot CSV prototype uses `record` to project
decoded CSV rows into a time-series DataSchema and supports it only on reads.

Here, `map:fields` is an object of nested pipelines for `record`. The older
combined draft below used the same spelling for bitfield definitions; that
usage is superseded by `octv:fields` in the octet-stream context and must not
be confused with record projection.

### JSON payload-binding context

```json
{
  "@context": {
    "jsonv": "https://example.org/wot/payload-binding/json/v1#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "path": { "@id": "jsonv:path", "@type": "xsd:string" },
    "onMissing": { "@id": "jsonv:onMissing", "@type": "xsd:string" },
    "default": "jsonv:default",
    "createMissing": { "@id": "jsonv:createMissing", "@type": "xsd:boolean" },
    "targetTemplate": "jsonv:targetTemplate",
    "template": "jsonv:template",
    "placeholder": { "@id": "jsonv:placeholder", "@type": "xsd:string" },
    "index": { "@id": "jsonv:index", "@type": "xsd:integer" }
  }
}
```

`pick`, `place`, `wrap`, `unwrap`, `at`, and `setAt` are JSON payload-binding operations. `jsonv:path` uses JSON Pointer (RFC 6901); templates, placeholders, indexes, and missing-member policy are likewise JSON-tree details.

### Octet-stream payload-binding context

```json
{
  "@context": {
    "octv": "https://example.org/wot/payload-binding/octet-stream/v1#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "byteOffset": { "@id": "octv:byteOffset", "@type": "xsd:nonNegativeInteger" },
    "byteLength": { "@id": "octv:byteLength", "@type": "xsd:positiveInteger" },
    "byteOrder": { "@id": "octv:byteOrder", "@type": "xsd:string" },
    "fields": { "@id": "octv:fields", "@container": "@list" },
    "fieldName": { "@id": "octv:fieldName", "@type": "xsd:string" },
    "mask": { "@id": "octv:mask", "@type": "xsd:integer" },
    "shift": { "@id": "octv:shift", "@type": "xsd:nonNegativeInteger" },
    "fieldType": { "@id": "octv:fieldType", "@type": "xsd:string" }
  }
}
```

`bitExtract` and `bitCompose` are octet-stream payload-binding operations. They use `octv:fields`, `octv:fieldName`, `octv:mask`, `octv:shift`, and `octv:fieldType` after the binding has decoded bytes according to `octv:byteOffset`, `octv:byteLength`, and `octv:byteOrder`. They do not belong to the `map` core.

The remaining combined-context material and examples below are retained as historical analysis. Their `map:path` family maps to the corresponding `jsonv:*` term, and their `map:fields` family maps to the corresponding `octv:*` term. New proposals and implementations MUST use the separated contexts above.

---

## Scope

**In scope:**
- Extracting nested object values from protocol payloads.
- Inserting application values into nested protocol payloads.
- Adding and removing fixed object or array envelopes.
- Selecting and updating array elements by index.
- Decomposing a packed integer (already decoded from the wire's byte array by the payload binding) into structured boolean or integer values.
- Composing structured fields back into a packed integer for the payload binding to encode onto the wire.
- Combining structural conversion with numeric scaling and enum mapping.

**Out of scope:**
- Arbitrary code execution or embedded scripts.
- Full JSONPath or query languages with filters, unions, or non-deterministic selectors.
- Protocol framing, addressing, headers, timing, and transport details.
- Numeric scaling and enum semantics themselves, which belong to user stories 3 and 4.
- Extracting multiple independently-positioned, differently-typed fields (e.g., a float and a timestamp) from distinct byte ranges of a larger payload; this is byte-offset/byte-length/type decoding, a payload-binding concern (see PROFINET's `profv:byteOffset`/`profv:byteLength`/`profv:type`), not a `bitExtract`/`bitCompose` bitmask concern.

---

## Candidate Structural Operations by Layer

| Layer | Operator | Directional purpose | Result |
|---|---|---|---|
| JSON binding (`jsonv`) | `pick` | Read a value at a declared JSON Pointer | Selected value |
| JSON binding (`jsonv`) | `place` | Write the current value at a declared JSON Pointer | Structured container |
| JSON binding (`jsonv`) | `wrap` | Add a fixed envelope around the current value | Wrapped object or array |
| JSON binding (`jsonv`) | `unwrap` | Remove one known envelope layer | Contained value |
| JSON binding (`jsonv`) | `at` | Read one array element | Selected array element |
| JSON binding (`jsonv`) | `setAt` | Replace one array element | Updated array |
| Octet-stream binding (`octv`) | `bitExtract` | Read named fields from a decoded integer using masks and shifts | Structured object |
| Octet-stream binding (`octv`) | `bitCompose` | Write structured fields into an integer using masks and shifts | Integer |

These binding-level operators are intentionally small and deterministic. They describe common structural mismatches without requiring protocol-specific code or an embedded programming language. The shared `record` collection operation belongs to the `map` core and is defined separately in [US2345-summary.md](./US2345-summary.md).

## Preferred-Layer Examples

The examples below use the separated JSON and octet-stream binding contexts, with format-neutral value transformations kept in the shared `map` pipeline.

### Example 1: IKEA Trådfri JSON Selection and Wrapping

The JSON binding selects the dimmer value from the decoded response on read and wraps the converted value in the partial JSON payload expected on write. Scaling and rounding remain generic `map` operations.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "jsonv": "https://example.org/wot/payload-binding/json/v1#"
    }
  ],
  "id": "urn:example:thing:ikea-tradfri-bulb-1",
  "title": "IKEATradfriBulb",
  "properties": {
    "brightness": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "readOnly": false,
      "forms": [
        {
          "href": "coaps://gateway.local:5684/15001/65538",
          "contentType": "application/json",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:proc": "pick", "jsonv:path": "/3311/0/5851" },
              { "map:proc": "mul", "map:value": 0.3937007874 },
              { "map:proc": "round", "map:mode": "nearest" }
            ],
            "map:toWire": [
              { "map:proc": "mul", "map:value": 2.54 },
              { "map:proc": "round", "map:mode": "nearest" },
              { "map:proc": "clamp", "map:min": 0, "map:max": 254 },
              {
                "map:proc": "wrap",
                "jsonv:template": { "3311": [{ "5851": "$value" }] },
                "jsonv:placeholder": "$value"
              }
            ]
          }
        }
      ]
    }
  }
}
```

---

### Example 2: Kasa Array Element Selection

The JSON binding can expose one element of a decoded relay-state array as a scalar property. This projection is read-only: `setAt` requires an array input, while the `outlet2` affordance supplies only a boolean. A writable version needs a defined source array or reconstruction/base-value policy.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "jsonv": "https://example.org/wot/payload-binding/json/v1#"
    }
  ],
  "id": "urn:example:thing:kasa-kp303-powerstrip-1",
  "title": "KasaKP303PowerStrip",
  "properties": {
    "outlet2": {
      "title": "Outlet 2 State",
      "type": "boolean",
      "readOnly": true,
      "forms": [
        {
          "href": "http://powerstrip.local/api/relays",
          "contentType": "application/json",
          "op": ["readproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:proc": "at", "jsonv:index": 1 }
            ]
          }
        }
      ]
    }
  }
}
```

### Example 3: SENTRON PAC4200 Octet-Stream Bitmap

The PAC4200 exposes a 32-bit `Limit Violations` value at Modbus holding-register offset `203`. The protocol binding identifies the register value; the octet-stream binding supplies the field masks and shifts. The complete field list is needed for the writable form because omitted bits would otherwise be composed as zero.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "modv": "https://www.w3.org/2019/wot/modbus",
      "octv": "https://example.org/wot/payload-binding/octet-stream/v1#",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    }
  ],
  "id": "urn:example:thing:sentron-pac4200-1",
  "title": "SentronPAC4200",
  "properties": {
    "limitViolations": {
      "title": "Limit Violations",
      "type": "object",
      "properties": {
        "limit0": { "type": "boolean" },
        "limit1": { "type": "boolean" },
        "limit2": { "type": "boolean" },
        "limit3": { "type": "boolean" },
        "limit4": { "type": "boolean" },
        "limit5": { "type": "boolean" },
        "limit6": { "type": "boolean" },
        "limit7": { "type": "boolean" },
        "limit8": { "type": "boolean" },
        "limit9": { "type": "boolean" },
        "limit10": { "type": "boolean" },
        "limit11": { "type": "boolean" },
        "logicFlag": { "type": "boolean" },
        "logicResult1": { "type": "boolean" },
        "logicResult2": { "type": "boolean" },
        "logicResult3": { "type": "boolean" },
        "logicResult4": { "type": "boolean" }
      },
      "forms": [
        {
          "href": "modbus://pac4200.local/holding-register/203",
          "contentType": "application/octet-stream",
          "modv:entity": "HoldingRegister",
          "modv:type": "xsd:unsignedLong",
          "octv:byteOffset": 0,
          "octv:byteLength": 4,
          "octv:byteOrder": "bigEndian",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:proc": "bitExtract",
                "octv:fields": [
                  { "octv:fieldName": "limit0", "octv:mask": 16777216, "octv:shift": 24, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit1", "octv:mask": 33554432, "octv:shift": 25, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit2", "octv:mask": 67108864, "octv:shift": 26, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit3", "octv:mask": 134217728, "octv:shift": 27, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit4", "octv:mask": 268435456, "octv:shift": 28, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit5", "octv:mask": 536870912, "octv:shift": 29, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit6", "octv:mask": 1073741824, "octv:shift": 30, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit7", "octv:mask": 2147483648, "octv:shift": 31, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit8", "octv:mask": 65536, "octv:shift": 16, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit9", "octv:mask": 131072, "octv:shift": 17, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit10", "octv:mask": 262144, "octv:shift": 18, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit11", "octv:mask": 524288, "octv:shift": 19, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicFlag", "octv:mask": 1, "octv:shift": 0, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicResult1", "octv:mask": 2, "octv:shift": 1, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicResult2", "octv:mask": 4, "octv:shift": 2, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicResult3", "octv:mask": 8, "octv:shift": 3, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicResult4", "octv:mask": 16, "octv:shift": 4, "octv:fieldType": "boolean" }
                ]
              }
            ],
            "map:toWire": [
              {
                "map:proc": "bitCompose",
                "octv:fields": [
                  { "octv:fieldName": "limit0", "octv:mask": 16777216, "octv:shift": 24, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit1", "octv:mask": 33554432, "octv:shift": 25, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit2", "octv:mask": 67108864, "octv:shift": 26, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit3", "octv:mask": 134217728, "octv:shift": 27, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit4", "octv:mask": 268435456, "octv:shift": 28, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit5", "octv:mask": 536870912, "octv:shift": 29, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit6", "octv:mask": 1073741824, "octv:shift": 30, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit7", "octv:mask": 2147483648, "octv:shift": 31, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit8", "octv:mask": 65536, "octv:shift": 16, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit9", "octv:mask": 131072, "octv:shift": 17, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit10", "octv:mask": 262144, "octv:shift": 18, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "limit11", "octv:mask": 524288, "octv:shift": 19, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicFlag", "octv:mask": 1, "octv:shift": 0, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicResult1", "octv:mask": 2, "octv:shift": 1, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicResult2", "octv:mask": 4, "octv:shift": 2, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicResult3", "octv:mask": 8, "octv:shift": 3, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "logicResult4", "octv:mask": 16, "octv:shift": 4, "octv:fieldType": "boolean" }
                ]
              }
            ]
          }
        }
      ]
    }
  }
}
```

### Example 4: Octet-Stream Bitfield Followed by Enum Mapping

This example composes a binding-level bitfield operation with a format-neutral enum operation. `octv` extracts `mode` as an integer; `map:name` then changes that same DataSchema member to its application enum value in place.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "modv": "https://www.w3.org/2019/wot/modbus",
      "octv": "https://example.org/wot/payload-binding/octet-stream/v1#",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    }
  ],
  "id": "urn:example:thing:daikin-altherma-1",
  "title": "DaikinAlthermaHeatPump",
  "properties": {
    "status": {
      "type": "object",
      "properties": {
        "alarm": { "type": "boolean" },
        "running": { "type": "boolean" },
        "mode": { "type": "string", "enum": ["off", "auto", "manual"] }
      },
      "required": ["alarm", "running", "mode"],
      "forms": [
        {
          "href": "modbus://altherma.local/holding-register/40001",
          "contentType": "application/octet-stream",
          "modv:entity": "HoldingRegister",
          "modv:type": "xsd:unsignedShort",
          "octv:byteOffset": 0,
          "octv:byteLength": 2,
          "octv:byteOrder": "bigEndian",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:proc": "bitExtract",
                "octv:fields": [
                  { "octv:fieldName": "alarm", "octv:mask": 1, "octv:shift": 0, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "running", "octv:mask": 2, "octv:shift": 1, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "mode", "octv:mask": 12, "octv:shift": 2, "octv:fieldType": "integer" }
                ]
              },
              {
                "map:proc": "enum",
                "map:name": "mode",
                "map:map": [
                  { "map:wire": 0, "map:app": "off" },
                  { "map:wire": 1, "map:app": "auto" },
                  { "map:wire": 2, "map:app": "manual" }
                ]
              }
            ],
            "map:toWire": [
              {
                "map:proc": "enum",
                "map:name": "mode",
                "map:map": [
                  { "map:app": "off", "map:wire": 0 },
                  { "map:app": "auto", "map:wire": 1 },
                  { "map:app": "manual", "map:wire": 2 }
                ]
              },
              {
                "map:proc": "bitCompose",
                "octv:fields": [
                  { "octv:fieldName": "alarm", "octv:mask": 1, "octv:shift": 0, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "running", "octv:mask": 2, "octv:shift": 1, "octv:fieldType": "boolean" },
                  { "octv:fieldName": "mode", "octv:mask": 12, "octv:shift": 2, "octv:fieldType": "integer" }
                ]
              }
            ]
          }
        }
      ]
    }
  }
}
```

`map:name` is the target DataSchema member name (`mode`), shared by the bitfield and enum steps. The enum operation does not rename the field.

## Superseded Combined Context (Historical Draft)

The separated `map`, `jsonv`, and `octv` contexts above are the preferred direction. The following combined context and the historical term reference, processing model, operator definitions, validation rules, and examples are retained to explain the analysis only; they are superseded and are not the current vocabulary proposal. In particular, they must not be read as defining JSON-path or octet-stream terms in the `map` core. The binding comparisons below are informative prior-art analysis, not a change to this allocation.

```json
{
  "@context": {
    "@version": 1.1,

    "map": "https://www.w3.org/wot/data-mapping/v1#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",

    "valueMapping": {
      "@id": "map:valueMapping",
      "@type": "@json"
    },

    "fromWire": {
      "@id": "map:fromWire",
      "@container": "@list"
    },

    "toWire": {
      "@id": "map:toWire",
      "@container": "@list"
    },

    "op": {
      "@id": "map:proc",
      "@type": "xsd:string"
    },

    "path": {
      "@id": "map:path",
      "@type": "xsd:string"
    },

    "onMissing": {
      "@id": "map:onMissing",
      "@type": "xsd:string"
    },

    "default": "map:default",

    "createMissing": {
      "@id": "map:createMissing",
      "@type": "xsd:boolean"
    },

    "targetTemplate": "map:targetTemplate",
    "template": "map:template",

    "placeholder": {
      "@id": "map:placeholder",
      "@type": "xsd:string"
    },

    "index": {
      "@id": "map:index",
      "@type": "xsd:integer"
    },

    "fields": {
      "@id": "map:fields",
      "@container": "@list"
    },

    "fieldName": {
      "@id": "map:name",
      "@type": "xsd:string"
    },

    "mask": {
      "@id": "map:mask",
      "@type": "xsd:integer"
    },

    "shift": {
      "@id": "map:shift",
      "@type": "xsd:integer"
    },

    "fieldType": {
      "@id": "map:type",
      "@type": "xsd:string"
    },

    "onError": {
      "@id": "map:onError",
      "@type": "xsd:string"
    }
  }
}
```

**Notes:**
- `valueMapping`, `fromWire`, and `toWire` are shared pipeline attachment and direction terms.
- `op` and the structural operation identifiers are proprietary execution step identifiers.
- `map:path` uses [JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901), restricted to object-member and array-index tokens. It does not support filtering, wildcards, unions, or expression evaluation.
- `map:template` and `map:placeholder` describe deterministic envelope construction.
- `map:fields`, `map:mask`, and `map:shift` describe bitfield layout; they do not replace binding-specific wire type and byte-order metadata.

### Historical Term Reference (Superseded)

#### Pipeline Attachment and Direction

| Term | Description |
|---|---|
| `map:valueMapping` | Container attached to a TD form that holds the structural pipeline. |
| `map:fromWire` | Ordered operation list applied when reading protocol data. |
| `map:toWire` | Ordered operation list applied when writing application data. |

#### Path and Envelope Operators

| Term | Used by | Description |
|---|---|---|
| `map:proc` | All operations | Operation identifier for the current pipeline step. |
| `map:path` | `pick`, `place`, `unwrap` | JSON Pointer identifying an object member or array element, such as `/d/v` or `/items/0/value`. The empty string identifies the complete input document. |
| `map:onMissing` | `pick`, `unwrap` | Missing-path policy: `error` (default), `null`, or `default`. |
| `map:default` | `pick`, `unwrap` | Value returned when `map:onMissing` is `default`. |
| `map:createMissing` | `place` | Whether missing intermediate containers are created; default is `true`. |
| `map:targetTemplate` | `place` | Initial object or array used when a target container does not already exist. |
| `map:template` | `wrap` | Object or array containing exactly one placeholder occurrence. |
| `map:placeholder` | `wrap` | Token replaced by the current value; default is `$value`. |
| `map:index` | `at`, `setAt` | Non-negative integer array index. |

#### Bitfield Operators

| Term | Used by | Description |
|---|---|---|
| `map:fields` | `bitExtract`, `bitCompose` | Ordered list of field definitions. |
| `map:name` | Field definition, `enum` or `enumRange` (when applied to one member of a structured object) | Key used as the structured object's member. MUST equal the name of the property or affordance (or nested object member) it maps to in the target DataSchema; it MUST NOT be a wire-only or intermediate label that differs from the final application-facing name. `enum` and `enumRange` update the selected member in place in both directions. |
| `map:mask` | Field definition | Non-zero integer mask selecting the field's bits. |
| `map:shift` | Field definition | Non-negative right shift for extraction or left shift for composition. |
| `map:type` | Field definition | `boolean` or `integer`; default is `integer`. `bitExtract`/`bitCompose` only ever read or write an unsigned integer magnitude; `boolean` and `integer` are the only possible outputs. Other application-facing types (scaled numbers, enum labels, timestamps) are reached by composing a follow-up operator — numeric scaling (user story 3) or exact lookup (user story 4) — on the extracted integer, not by adding values to `map:type`. |

`wireValue` is the integer passed into `bitExtract` on read, or produced by `bitCompose` on write; it represents the full protocol-side value being decomposed or assembled (for example, one Modbus register, or a value already combined from multiple registers by the binding). `fieldValue` is the value of one named field in the structured object handled by `bitExtract`/`bitCompose` — one member of the application-facing property, not the whole property.

For extraction, each field is computed independently from the same `wireValue`:

$$
fieldValue = (wireValue \mathbin{\&} mask) \mathbin{>>} shift
$$

For composition, the composed integer is built incrementally over `map:fields`, in list order. Let $wireValue_0 = 0$ be the initial accumulator. For each field $i$:

$$
wireValue_i = wireValue_{i-1} \mathbin{|} ((fieldValue_i \mathbin{<<} shift_i) \mathbin{\&} mask_i)
$$

The composed integer is $wireValue_n$ after the last field has been placed. Because masks in one operation must not overlap, the accumulation order does not affect the result. Bits not covered by any field definition are `0` in the composed integer; a binding that must preserve reserved or unused bits from the device's current value needs an explicit base value, which `bitCompose` does not yet define.

Masks in one operation must not overlap. A boolean field is `false` when its extracted value is zero and `true` otherwise.

#### Error Handling

| Term | Description |
|---|---|
| `map:onError` | Per-operation failure policy. `error` is the default; `skip` passes the unchanged input to the next operation. |

---

## Historical Processing Model

Each form declares the direction explicitly:

- `fromWire`: protocol payload to application value.
- `toWire`: application value to protocol payload.

When structural conversion is combined with numeric and enum mapping, the default order is:

1. `fromWire`: structural conversion, then numeric operations, then enum mapping.
2. `toWire`: reverse enum mapping, then inverse numeric operations, then structural conversion.

The output of each operation becomes the input of the next operation. Implementations MUST execute each direction list in document order. JSON arrays are ordered, and the JSON-LD `@list` container preserves ordered list semantics.

Structural operations can be composed in either direction. For example, a read path may use `pick` followed by numeric scaling, while a write path may use inverse scaling followed by `place`. A `bitExtract` result may be followed by an exact or range enum operation on one named field as described by user story 4. When `enum` or `enumRange` is applied to a structured object rather than the whole current value, `map:name` selects the target DataSchema member to read and is also the member written back; both operations update that member in place and never rename it. `map:name` MUST match the target property or nested-member name. Renaming a member to a different application-facing name is a structural concern handled by `pick`/`place`, not by an enum operation.

---

## Historical Operator Definitions (Superseded)

### `pick`

`pick` extracts one value from the current object or array using `map:path`. The path MUST be a valid JSON Pointer and resolve deterministically; the empty string selects the complete input document. The output is the selected value.

An unresolved path follows `map:onMissing`: `error` by default, `null` for a null result, or `default` when `map:default` is supplied.

### `place`

`place` inserts the current value at the JSON Pointer given by `map:path` in an output object or array. Missing intermediate containers are created when `map:createMissing` is `true`. `map:targetTemplate` supplies the initial output container when required. JSON Pointer identifies the target; creation, replacement, and collision behavior remain defined by `place`.

A path collision with a scalar where an object or array is required is an error. `place` must not produce a value that violates the target schema.

### `wrap`

`wrap` replaces exactly one occurrence of `map:placeholder` in `map:template` with the current value. The default placeholder is `$value`. A template with zero or multiple placeholders is invalid.

### `unwrap`

`unwrap` selects the contained value from one known envelope layer using the JSON Pointer in `map:path` or an equivalent placeholder rule. Supplying both path and placeholder selectors is invalid. Supplying neither is invalid.

### `at` and `setAt`

`at` returns the element at `map:index` from the current array. `setAt` replaces that element and returns the updated array. The index must be an integer and must be in range unless an explicit extension defines array growth behavior. The input must be an array.

### `bitExtract`

`bitExtract` requires a non-empty `map:fields` list and an integer input. For every field it applies the mask and shift formula and returns an object keyed by `map:name`. Masks must be non-zero, compatible with the supported integer width, and pairwise non-overlapping.

### `bitCompose`

`bitCompose` requires a structured object containing the declared fields. It converts boolean values to `0` or `1`, validates integer field widths, places each value using its mask and shift, and returns the composed integer. Missing fields and overflow beyond a field mask are errors by default.

---

## Historical Invertibility and Writability Rules (Superseded)

- A form is writable only when `map:toWire` is defined or can be derived without ambiguity.
- `pick` is commonly read-only unless the complete target structure is supplied or a deterministic `place`/`wrap` rule exists.
- `unwrap` is commonly read-only unless the removed envelope can be reconstructed by `wrap` or another explicit operation.
- `bitExtract` must be paired with `bitCompose` for a writable structured representation.
- Dropped fields, omitted envelope members, and lossy reductions require a canonical reconstruction rule or make the transformed view read-only.
- Implementations must not guess missing fields, array positions, or envelope members.

---

## Historical Validation and Error Semantics (Superseded)

Normative checks should include:

- Invalid or ambiguous paths are rejected before conversion.
- Empty paths and malformed array indexes are invalid.
- `map:default` is valid only with `map:onMissing: "default"`.
- `place` path collisions and incompatible target container types produce `error`.
- `at` and `setAt` require integer indexes and array inputs.
- Templates must contain exactly one placeholder.
- Bitfield masks must be non-zero, non-overlapping, and compatible with the declared integer width.
- Shifts must be non-negative and compatible with their masks.
- Missing required structured fields and field overflow produce `error` by default.
- A conversion that yields a value violating the target DataSchema is invalid.
- `map:onError: "skip"` passes the unchanged input to the next operation; it does not silently produce `null`.
- An absent or ambiguous write path produces `error` rather than an implementation-defined reconstruction.

---

## Historical Examples

These are archival source forms using the earlier combined `map` spelling. Their preferred-layer rewrites appear in `Preferred-Layer Examples` above. Do not copy the historical terms into new proposals or implementations.

### Example 1: IKEA Trådfri CoAP Bulb Dimmer Extraction and Placement

The IKEA Trådfri Gateway (E1526) exposes connected smart light bulbs (such as the TRÅDFRI bulb E27 WS opal 980lm) over CoAP/DTLS at endpoints like `coaps://gateway.local:5684/15001/65538`. The gateway uses IPSO Smart Object structures in JSON payloads. A complete read response contains device metadata and the available light resources, for example:

```json
{
  "3": {
    "0": "IKEA of Sweden",
    "1": "TRADFRI bulb E27 CWS opal 600lm",
    "2": "",
    "3": "1.3.002",
    "6": 1,
    "7": 1
  },
  "3311": [
    {
      "5706": "f5faf6",
      "5707": 0,
      "5708": 0,
      "5709": 24930,
      "5710": 24694,
      "5711": 250,
      "5850": 1,
      "5851": 254,
      "9003": 0
    }
  ],
  "5750": 2,
  "9001": "Living Room Bulb",
  "9002": 1508005342,
  "9003": 65537,
  "9019": 1,
  "9020": 1508012549,
  "9054": 0
}
```

Here, `3311` is the light-control object represented as an array, and `/3311/0/5851` is the JSON Pointer to the first light's raw dimmer value (`0..254`). The application property exposes a clean percentage scale (`0..100%`). On read, `map:proc: "pick"` extracts that nested value before numeric scaling is applied. A write request is a smaller partial payload, for example `{"3311": [{"5851": 127}]}`; the percentage is scaled back to `0..254`, rounded, and `map:proc: "wrap"` constructs this nested envelope for the CoAP payload.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "qudt": "http://qudt.org/schema/qudt/",
      "unit": "http://qudt.org/vocab/unit/",
      "quantitykind": "http://qudt.org/vocab/quantitykind/"
    }
  ],
  "id": "urn:example:thing:ikea-tradfri-bulb-1",
  "title": "IKEATradfriBulb",
  "properties": {
    "brightness": {
      "title": "Brightness",
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "unit": "unit:PERCENT",
      "readOnly": false,
      "forms": [
        {
          "href": "coaps://gateway.local:5684/15001/65538",
          "contentType": "application/json",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:proc": "pick", "map:path": "/3311/0/5851" },
              { "map:proc": "mul", "map:value": 0.3937007874 },
              { "map:proc": "round", "map:mode": "nearest" }
            ],
            "map:toWire": [
              { "map:proc": "mul", "map:value": 2.54 },
              { "map:proc": "round", "map:mode": "nearest" },
              { "map:proc": "clamp", "map:min": 0, "map:max": 254 },
              {
                "map:proc": "wrap",
                "map:template": {
                  "3311": [
                    {
                      "5851": "$value"
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- `map:proc: "pick"` extracts the nested IPSO resource `5851` at JSON Pointer `/3311/0/5851` from the complex CoAP JSON response on read.
- The pipeline composes structural extraction with numeric scaling and rounding to expose a clean `0..100%` brightness property.
- On write, `map:proc: "wrap"` reconstructs the required nested JSON envelope (`{"3311": [{"5851": "$value"}]}`) expected by the Trådfri gateway.
- JSON Schema and QUDT annotate the application-level data model, while `map` handles the runtime transformation to and from the protocol wire payload.

### Example 2: Array Element Selection and Update for a Multi-Outlet Power Strip

The TP-Link Kasa KP303 is a 3-outlet smart power strip where device controllers can interact with the relay states of all outlets formatted as an array of boolean values `[true, false, true]`.

This example exposes an individual boolean property `outlet2` for the second socket. On read, `map:proc: "at"` selects the element at array index `1`. On write, `map:proc: "setAt"` updates the element at index `1` in the state array.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:kasa-kp303-powerstrip-1",
  "title": "KasaKP303PowerStrip",
  "properties": {
    "outlet2": {
      "title": "Outlet 2 State",
      "type": "boolean",
      "readOnly": false,
      "forms": [
        {
          "href": "http://powerstrip.local/api/relays",
          "contentType": "application/json",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:proc": "at", "map:index": 1 }
            ],
            "map:toWire": [
              {
                "map:proc": "setAt",
                "map:index": 1
              }
            ]
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- `map:proc: "at"` selects a stable array element by index (`1` for the second outlet) from the protocol array payload on read.
- `map:proc: "setAt"` updates the element at that index when writing an application boolean back to the array.
- The surrounding array is managed by the pipeline to update one channel while preserving the positions of other channels.

### Example 3: SENTRON PAC4200 Non-Contiguous Limit Violation Bitmap

The Siemens SENTRON PAC4200 power monitoring device exposes a Modbus `Unsigned long` value named `Limit Violations` at offset `203`. The value occupies two 16-bit registers and contains 12 limit flags and 5 logic-result flags distributed across non-contiguous bytes: limits 0-7 are in byte 3, limits 8-11 are in the low nibble of byte 2, and the logic flags are in byte 0. Byte 1 and parts of byte 2 are unused.

This is the bitmap challenge described in [issue 1930](https://github.com/w3c/wot-thing-description/issues/1930), especially the [PAC4200 discussion](https://github.com/w3c/wot-thing-description/issues/1930#issuecomment-4342467719). The application exposes the packed value as an object of named boolean properties. `map:bitExtract` decomposes the 32-bit Modbus value on read, and `map:bitCompose` reconstructs it on write. The masks are non-contiguous in the overall word, but each individual field still has a distinct, non-overlapping mask.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:sentron-pac4200-1",
  "title": "SentronPAC4200",
  "properties": {
    "limitViolations": {
      "title": "Limit Violations",
      "type": "object",
      "properties": {
        "limit0": { "type": "boolean" },
        "limit1": { "type": "boolean" },
        "limit2": { "type": "boolean" },
        "limit3": { "type": "boolean" },
        "limit4": { "type": "boolean" },
        "limit5": { "type": "boolean" },
        "limit6": { "type": "boolean" },
        "limit7": { "type": "boolean" },
        "limit8": { "type": "boolean" },
        "limit9": { "type": "boolean" },
        "limit10": { "type": "boolean" },
        "limit11": { "type": "boolean" },
        "logicFlag": { "type": "boolean" },
        "logicResult1": { "type": "boolean" },
        "logicResult2": { "type": "boolean" },
        "logicResult3": { "type": "boolean" },
        "logicResult4": { "type": "boolean" }
      },
      "required": [
        "limit0",
        "limit1",
        "limit2",
        "limit3",
        "limit4",
        "limit5",
        "limit6",
        "limit7",
        "limit8",
        "limit9",
        "limit10",
        "limit11",
        "logicFlag",
        "logicResult1",
        "logicResult2",
        "logicResult3",
        "logicResult4"
      ],
      "forms": [
        {
          "href": "modbus://pac4200.local/holding-register/203",
          "contentType": "application/octet-stream",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:proc": "bitExtract",
                "map:fields": [
                  { "map:name": "limit0", "map:mask": 16777216, "map:shift": 24, "map:type": "boolean" },
                  { "map:name": "limit1", "map:mask": 33554432, "map:shift": 25, "map:type": "boolean" },
                  { "map:name": "limit2", "map:mask": 67108864, "map:shift": 26, "map:type": "boolean" },
                  { "map:name": "limit3", "map:mask": 134217728, "map:shift": 27, "map:type": "boolean" },
                  { "map:name": "limit4", "map:mask": 268435456, "map:shift": 28, "map:type": "boolean" },
                  { "map:name": "limit5", "map:mask": 536870912, "map:shift": 29, "map:type": "boolean" },
                  { "map:name": "limit6", "map:mask": 1073741824, "map:shift": 30, "map:type": "boolean" },
                  { "map:name": "limit7", "map:mask": 2147483648, "map:shift": 31, "map:type": "boolean" },
                  { "map:name": "limit8", "map:mask": 65536, "map:shift": 16, "map:type": "boolean" },
                  { "map:name": "limit9", "map:mask": 131072, "map:shift": 17, "map:type": "boolean" },
                  { "map:name": "limit10", "map:mask": 262144, "map:shift": 18, "map:type": "boolean" },
                  { "map:name": "limit11", "map:mask": 524288, "map:shift": 19, "map:type": "boolean" },
                  { "map:name": "logicFlag", "map:mask": 1, "map:shift": 0, "map:type": "boolean" },
                  { "map:name": "logicResult1", "map:mask": 2, "map:shift": 1, "map:type": "boolean" },
                  { "map:name": "logicResult2", "map:mask": 4, "map:shift": 2, "map:type": "boolean" },
                  { "map:name": "logicResult3", "map:mask": 8, "map:shift": 3, "map:type": "boolean" },
                  { "map:name": "logicResult4", "map:mask": 16, "map:shift": 4, "map:type": "boolean" }
                ]
              }
            ],
            "map:toWire": [
              {
                "map:proc": "bitCompose",
                "map:fields": [
                  { "map:name": "limit0", "map:mask": 16777216, "map:shift": 24, "map:type": "boolean" },
                  { "map:name": "limit1", "map:mask": 33554432, "map:shift": 25, "map:type": "boolean" },
                  { "map:name": "limit2", "map:mask": 67108864, "map:shift": 26, "map:type": "boolean" },
                  { "map:name": "limit3", "map:mask": 134217728, "map:shift": 27, "map:type": "boolean" },
                  { "map:name": "limit4", "map:mask": 268435456, "map:shift": 28, "map:type": "boolean" },
                  { "map:name": "limit5", "map:mask": 536870912, "map:shift": 29, "map:type": "boolean" },
                  { "map:name": "limit6", "map:mask": 1073741824, "map:shift": 30, "map:type": "boolean" },
                  { "map:name": "limit7", "map:mask": 2147483648, "map:shift": 31, "map:type": "boolean" },
                  { "map:name": "limit8", "map:mask": 65536, "map:shift": 16, "map:type": "boolean" },
                  { "map:name": "limit9", "map:mask": 131072, "map:shift": 17, "map:type": "boolean" },
                  { "map:name": "limit10", "map:mask": 262144, "map:shift": 18, "map:type": "boolean" },
                  { "map:name": "limit11", "map:mask": 524288, "map:shift": 19, "map:type": "boolean" },
                  { "map:name": "logicFlag", "map:mask": 1, "map:shift": 0, "map:type": "boolean" },
                  { "map:name": "logicResult1", "map:mask": 2, "map:shift": 1, "map:type": "boolean" },
                  { "map:name": "logicResult2", "map:mask": 4, "map:shift": 2, "map:type": "boolean" },
                  { "map:name": "logicResult3", "map:mask": 8, "map:shift": 3, "map:type": "boolean" },
                  { "map:name": "logicResult4", "map:mask": 16, "map:shift": 4, "map:type": "boolean" }
                ]
              }
            ]
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- The PAC4200 exposes one 32-bit Modbus value, while the application sees 17 named boolean properties.
- `map:bitExtract` supports fields distributed across non-contiguous parts of the word; unused bits and bytes simply have no field definition.
- `map:bitCompose` provides the explicit reverse mapping for a writable structured representation.
- The masks are individual, non-overlapping bit masks even though the groups of fields are separated by unused wire positions.

### Example 4: Bitfield With Enum Conversion for an HVAC Heat Pump

The Daikin Altherma heat pump with Modbus interface communicates system status through 16-bit holding registers (such as register `40001`). The register packs boolean flags for `alarm` (bit 0) and `running` (bit 1) together with a 2-bit integer mode code (`0`, `1`, `2` at bits 2–3).

The application property `status` exposes semantic fields: `alarm` (boolean), `running` (boolean), and `mode` (string enum: `"off"`, `"auto"`, `"manual"`). This requires composing structural bitfield extraction with enum conversion in a single pipeline.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:daikin-altherma-1",
  "title": "DaikinAlthermaHeatPump",
  "properties": {
    "status": {
      "title": "Heat Pump Status",
      "type": "object",
      "properties": {
        "alarm": { "type": "boolean" },
        "running": { "type": "boolean" },
        "mode": { "type": "string", "enum": ["off", "auto", "manual"] }
      },
      "required": ["alarm", "running", "mode"],
      "forms": [
        {
          "href": "modbus://altherma.local/holding-register/40001",
          "contentType": "application/octet-stream",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:proc": "bitExtract",
                "map:fields": [
                  { "map:name": "alarm", "map:mask": 1, "map:shift": 0, "map:type": "boolean" },
                  { "map:name": "running", "map:mask": 2, "map:shift": 1, "map:type": "boolean" },
                  { "map:name": "mode", "map:mask": 12, "map:shift": 2, "map:type": "integer" }
                ]
              },
              {
                "map:proc": "enum",
                "map:name": "mode",
                "map:map": [
                  { "map:wire": 0, "map:app": "off" },
                  { "map:wire": 1, "map:app": "auto" },
                  { "map:wire": 2, "map:app": "manual" }
                ]
              }
            ],
            "map:toWire": [
              {
                "map:proc": "enum",
                "map:name": "mode",
                "map:map": [
                  { "map:app": "off", "map:wire": 0 },
                  { "map:app": "auto", "map:wire": 1 },
                  { "map:app": "manual", "map:wire": 2 }
                ]
              },
              {
                "map:proc": "bitCompose",
                "map:fields": [
                  { "map:name": "alarm", "map:mask": 1, "map:shift": 0, "map:type": "boolean" },
                  { "map:name": "running", "map:mask": 2, "map:shift": 1, "map:type": "boolean" },
                  { "map:name": "mode", "map:mask": 12, "map:shift": 2, "map:type": "integer" }
                ]
              }
            ]
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- `bitExtract` names the mode field `mode` directly, the same name used by the application-facing `status.mode` property, so no rename is needed later in the pipeline.
- The read pipeline first extracts the bitfield into discrete fields with `map:proc: "bitExtract"`, then converts the `mode` field's raw integer to its string enum in place with `map:proc: "enum"` and `map:name: "mode"`.
- The write pipeline executes the inverse sequence: reverse enum mapping in place on `mode`, followed by `map:proc: "bitCompose"` to pack the fields into the 16-bit Modbus integer.
- A single, consistent `map:name` selects the same object member for `bitExtract`, `enum`, and `bitCompose`, leaving the other fields (`alarm`, `running`) untouched; `enum` reads and writes the same key rather than renaming it.

---

## Binding Comparison

### LoRaWAN

LoRaWAN terms such as `lorav:byteOffset`, `lorav:presenceField`, `lorav:switchField`, and `lorav:guard` describe protocol-specific payload layout and conditional inclusion. They relate to structural conversion, but are not all direct equivalents of the phase 1 operators:

| LoRaWAN term | General relation |
|---|---|
| `lorav:byteOffset` | Binding wire-layout metadata, not `map:path` |
| `lorav:presenceField` / `lorav:presenceBit` | Conditional structural behavior beyond phase 1 |
| `lorav:switchField` / `lorav:switchValue` | Discriminator-based structural selection beyond phase 1 |
| `lorav:ref` | Reference to another field; may be needed by a future composite operator |

### Modbus

The Modbus binding does not define a generic structural conversion vocabulary in the reviewed material. `modv:function`, `modv:entity`, `modv:address`, and `modv:quantity` select the protocol operation and register range, while byte order and payload length describe wire representation. `map:bitExtract` and `map:bitCompose` can supply the missing logical field conversion after the Modbus value has been decoded as an integer.

### BACnet

The BACnet binding describes protocol-side structure through `bacv:hasDataType` and its BACnet datatype classes. `bacv:Sequence` and `bacv:List` represent structured and array-like values, while `bacv:hasMember` describes members of a sequence or list. `bacv:Choice` and `bacv:hasNamedMember`, together with `bacv:hasFieldName` and `bacv:hasContextTag`, describe named alternatives and their BACnet context tags. These terms provide protocol-specific type and encoding metadata rather than a general-purpose path transformation pipeline.

| BACnet term | General relation |
|---|---|
| `bacv:hasDataType` | Protocol-side type metadata; used alongside `map:valueMapping`, not replaced by it |
| `bacv:Sequence` / `bacv:List` | Structured or array-like wire values; can be reshaped with `map:wrap`, `map:unwrap`, `map:at`, and `map:setAt` when the payload is exposed as JSON-like data |
| `bacv:hasMember` | Declares a member of a sequence or list; relates to a structural target addressed by `map:path` and `map:place` |
| `bacv:Choice` / `bacv:hasNamedMember` | Protocol choice and named-member metadata; conditional selection is outside the current `map` operator set |
| `bacv:hasFieldName` | Name of a protocol-side named member; may correspond to an object key addressed by `map:path` |
| `bacv:hasContextTag` | BACnet encoding metadata; has no direct `map` equivalent |
| `bacv:hasValueMap` / `bacv:hasProtocolVal` / `bacv:hasLogicalVal` | Exact enum conversion, corresponding to the enum operation from user story 4 rather than to a structural operator |

The BACnet binding's enum-mapping example uses `bacv:hasValueMap` to map protocol values to logical values, while its datatype mapping section uses `bacv:Sequence`, `bacv:List`, and `bacv:Choice` to describe the wire model. The generic `map` vocabulary can supply explicit extraction, placement, wrapping, unwrapping, and array operations after a BACnet payload has been decoded, but it does not replace BACnet service terms, datatype declarations, context tags, or other encoding metadata.

### PROFINET

The PROFINET binding defines `profv:payloadMapping` and related byte/bit position terms for mapping complex data types. Its structural concepts are protocol-aware and remain useful for describing payload layout. The general mapping model corresponds as follows:

| PROFINET term | General relation |
|---|---|
| `profv:payloadMapping` | `map:valueMapping` structural pipeline |
| `profv:byteOffset` / `profv:byteLength` | Binding wire-layout metadata before structural conversion |
| `profv:bitOffset` / `profv:bitlength` | `map:mask` and `map:shift` conceptually, with binding-specific byte layout retained |

The general operators should not replace byte order, byte offsets, or native PROFINET type declarations.

---

## Role of `map` Terms as Default and Fallback for Binding Implementations

### Two valid homes for the same concept

A binding may define protocol-specific structural terms because it must describe byte positions, discriminators, presence flags, or native payload layout. The generic `map` vocabulary defines reusable structural execution semantics independent of a particular protocol.

1. Binding terms describe where and how the protocol carries data.
2. `map` terms describe how a decoded value is reshaped into the application DataSchema, or how an application value is reshaped for the protocol.

### `map` as a default and fallback

A binding implementation may delegate generic path extraction, envelope conversion, array indexing, or bitfield conversion to a shared `map` implementation when its binding terms have equivalent semantics. A new binding can use `map` directly for generic structure conversion and reserve its own vocabulary for transport and wire-layout details.

Binding-specific conditional payload selection and byte-layout metadata should remain binding-specific unless equivalent general operators are standardized later.

### Practical implications

- One structural pipeline implementation can serve JSON, Modbus, PROFINET, LoRaWAN, and other protocol adapters.
- JSON Schema remains responsible for validating the resulting application and wire structures.
- Explicit reverse operations avoid guessed reconstruction of dropped fields or envelopes.
- Conformance behavior for missing paths, mask overlap, and invalid indexes can be shared across bindings.
