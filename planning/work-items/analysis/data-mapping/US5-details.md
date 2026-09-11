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
  - This does NOT include mathematical operations, that is above above point 3
  - This does NOT restrict itself to simple type conversion, that is above point 4. However, this can be applied on top of point 4.

---

## User Story Summary

**Problem:** The structure of a protocol payload does not match the structure of the application-facing DataSchema. Examples include a value nested inside an envelope, an application value that must be inserted into a nested wire object, an array element that must be selected, and several logical flags packed into one integer bitfield.

**Proposed solution:** A declarative, direction-explicit structural conversion pipeline attached at form level. The pipeline uses simple deterministic operators for path selection, placement, wrapping, array access, and bitfield conversion. It can be composed with the numeric operations of user story 3 and the enum operations of user story 4.

**Core operators:**
- `pick` - extract a value at a dot-notation path.
- `place` - insert the current value at a dot-notation path.
- `wrap` - put the current value into a fixed object or array template.
- `unwrap` - remove a known envelope layer.
- `at` - select an array element by integer index.
- `setAt` - set an array element by integer index.
- `bitExtract` - convert one integer into a structured object of named fields.
- `bitCompose` - convert a structured object of fields into one integer.

**Key design decisions:**
- Direction is explicit per form: `map:fromWire` for protocol-to-application and `map:toWire` for application-to-protocol.
- Operations are applied in document order and each operation receives the previous operation's output.
- Paths use deterministic dot notation with optional array indexes, not an unrestricted query language.
- Missing-path behavior is explicit and defaults to `error`.
- Bitfield masks must be non-zero and non-overlapping; shifts must be non-negative.
- A write path must be declared or derivable without ambiguity. Lossy structural reductions are read-only unless reconstruction is explicitly defined.

---

## Scope

**In scope:**
- Extracting nested object values from protocol payloads.
- Inserting application values into nested protocol payloads.
- Adding and removing fixed object or array envelopes.
- Selecting and updating array elements by index.
- Decomposing packed integer fields into structured boolean or integer values.
- Composing structured fields back into packed integer values.
- Combining structural conversion with numeric scaling and enum mapping.

**Out of scope:**
- Arbitrary code execution or embedded scripts.
- Full JSONPath or query languages with filters, unions, or non-deterministic selectors.
- Protocol framing, addressing, headers, timing, and transport details.
- Numeric scaling and enum semantics themselves, which belong to user stories 3 and 4.

---

## Candidate Core Conversion Set

| Operator | Directional purpose | Result |
|---|---|---|
| `pick` | Read a value at a declared object/array path | Selected value |
| `place` | Write the current value at a declared object/array path | Structured container |
| `wrap` | Add a fixed envelope around the current value | Wrapped object or array |
| `unwrap` | Remove one known envelope layer | Contained value |
| `at` | Read one array element | Selected array element |
| `setAt` | Replace one array element | Updated array |
| `bitExtract` | Read named fields from an integer using masks and shifts | Structured object |
| `bitCompose` | Write named fields into an integer using masks and shifts | Integer |

These operators are intentionally small and deterministic. They describe common structural mismatches without requiring protocol-specific code or an embedded programming language.

---

## Standard Term Evaluation

### QUDT

**Covers well:**
- Quantity and unit semantics for values contained in the structure.
- Scale and enumeration descriptions that may be applied after structural extraction.

**Does not cover:**
- TD form-level path extraction or placement.
- Object and array envelope conversion.
- Bit extraction and composition.
- Missing-path behavior or write reconstruction policy.

**Recommended use:** Use QUDT for the meaning of extracted values, but use `map` for structural execution. For example, a picked nested temperature can carry QUDT temperature semantics while `map:pick` selects its wire location.

### FnO (Function Ontology)

**Covers well:**
- Reusable functions and their input/output signatures.
- Composed functions that could describe a reusable structural conversion.

**Does not cover:**
- A standard compact path language for `pick` and `place`.
- A standard envelope template or placeholder model.
- A built-in bitfield mask and shift vocabulary.
- TD form-level direction, missing-path policy, and structural write safety.

**Recommended use:** Use FnO for reusable structural functions or implementation descriptions. Keep `map` for compact inline structural operators and TD-specific execution policy.

### JSON Schema

**Covers well:**
- Object and array shape constraints.
- Required properties, property types, array lengths, and nested schemas.
- Validation of the application-facing structure and the target wire structure.

**Does not cover:**
- Executable path extraction or insertion.
- Envelope wrapping and unwrapping.
- Array element selection and update.
- Bitwise extraction and composition.
- Directional write reconstruction.

**Recommended use:** Use JSON Schema to validate both ends of a structural mapping. Use `map` to perform the conversion between those shapes.

---

## Capability Matrix Summary

| Capability | QUDT | FnO | JSON Schema | Keep `map`? |
|---|---|---|---|---|
| Quantity semantics inside a structure | Strong | Weak | Weak | Usually no |
| Object shape validation | Weak | Weak | Strong | No |
| Nested path extraction/insertion | Weak | Partial | Weak | Yes |
| Fixed envelope wrapping | Weak | Partial | Partial | Yes |
| Array index conversion | Weak | Partial | Partial | Yes |
| Bitfield decomposition/composition | Weak | Partial | Weak | Yes |
| Directional execution | Weak | Weak | Weak | Yes |
| Missing-path and reconstruction policy | Weak | Weak | Weak | Yes |
| Composition with numeric and enum steps | Weak | Partial | Weak | Yes |

---

## Proprietary Context Definition

The following JSON-LD context defines the structural conversion terms not covered by QUDT, FnO, or JSON Schema. The namespace is a placeholder and the prefix `map` is used throughout this document.

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
- `map:path` is deliberately narrower than a general query language: it addresses object keys and array indexes only.
- `map:template` and `map:placeholder` describe deterministic envelope construction.
- `map:fields`, `map:mask`, and `map:shift` describe bitfield layout; they do not replace binding-specific wire type and byte-order metadata.

### Term Reference

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
| `map:path` | `pick`, `place`, `unwrap` | Dot-notation path over object keys and optional array indexes, such as `d.v` or `items[0].value`. |
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
| `map:name` | Field definition | Name used as the structured object's key. |
| `map:mask` | Field definition | Non-zero integer mask selecting the field's bits. |
| `map:shift` | Field definition | Non-negative right shift for extraction or left shift for composition. |
| `map:type` | Field definition | `boolean` or `integer`; default is `integer`. |

For extraction, a field is computed as:

$$
fieldValue = (wireValue \mathbin{\&} mask) \mathbin{>>} shift
$$

For composition, a field is placed as:

$$
wireValue = wireValue \mathbin{|} ((fieldValue \mathbin{<<} shift) \mathbin{\&} mask)
$$

Masks in one operation must not overlap. A boolean field is `false` when its extracted value is zero and `true` otherwise.

#### Error Handling

| Term | Description |
|---|---|
| `map:onError` | Per-operation failure policy. `error` is the default; `skip` passes the unchanged input to the next operation. |

---

## Processing Model

Each form declares the direction explicitly:

- `fromWire`: protocol payload to application value.
- `toWire`: application value to protocol payload.

When structural conversion is combined with numeric and enum mapping, the default order is:

1. `fromWire`: structural conversion, then numeric operations, then enum mapping.
2. `toWire`: reverse enum mapping, then inverse numeric operations, then structural conversion.

The output of each operation becomes the input of the next operation. Implementations MUST execute each direction list in document order. JSON arrays are ordered, and the JSON-LD `@list` container preserves ordered list semantics.

Structural operations can be composed in either direction. For example, a read path may use `pick` followed by numeric scaling, while a write path may use inverse scaling followed by `place`. A `bitExtract` result may be followed by an exact enum operation on one named field as described by user story 4.

---

## Operator Definitions

### `pick`

`pick` extracts one value from the current object or array using `map:path`. The path must be non-empty and resolve deterministically. The output is the selected value.

An unresolved path follows `map:onMissing`: `error` by default, `null` for a null result, or `default` when `map:default` is supplied.

### `place`

`place` inserts the current value at `map:path` in an output object or array. Missing intermediate containers are created when `map:createMissing` is `true`. `map:targetTemplate` supplies the initial output container when required.

A path collision with a scalar where an object or array is required is an error. `place` must not produce a value that violates the target schema.

### `wrap`

`wrap` replaces exactly one occurrence of `map:placeholder` in `map:template` with the current value. The default placeholder is `$value`. A template with zero or multiple placeholders is invalid.

### `unwrap`

`unwrap` selects the contained value from one known envelope layer using `map:path` or an equivalent placeholder rule. Supplying both path and placeholder selectors is invalid. Supplying neither is invalid.

### `at` and `setAt`

`at` returns the element at `map:index` from the current array. `setAt` replaces that element and returns the updated array. The index must be an integer and must be in range unless an explicit extension defines array growth behavior. The input must be an array.

### `bitExtract`

`bitExtract` requires a non-empty `map:fields` list and an integer input. For every field it applies the mask and shift formula and returns an object keyed by `map:name`. Masks must be non-zero, compatible with the supported integer width, and pairwise non-overlapping.

### `bitCompose`

`bitCompose` requires a structured object containing the declared fields. It converts boolean values to `0` or `1`, validates integer field widths, places each value using its mask and shift, and returns the composed integer. Missing fields and overflow beyond a field mask are errors by default.

---

## Invertibility and Writability Rules

- A form is writable only when `map:toWire` is defined or can be derived without ambiguity.
- `pick` is commonly read-only unless the complete target structure is supplied or a deterministic `place`/`wrap` rule exists.
- `unwrap` is commonly read-only unless the removed envelope can be reconstructed by `wrap` or another explicit operation.
- `bitExtract` must be paired with `bitCompose` for a writable structured representation.
- Dropped fields, omitted envelope members, and lossy reductions require a canonical reconstruction rule or make the transformed view read-only.
- Implementations must not guess missing fields, array positions, or envelope members.

---

## Validation and Error Semantics

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

## Examples

All examples include proprietary `map` terms and available standard terms where useful.

### Example 1: IKEA Trådfri CoAP Bulb Dimmer Extraction and Placement

The IKEA Trådfri Gateway (E1526) exposes connected smart light bulbs (such as the TRÅDFRI bulb E27 WS opal 980lm) over CoAP/DTLS at endpoints like `coaps://gateway.local:5684/15001/65538`. The gateway uses IPSO Smart Object structures in JSON payloads, where the light control parameters are nested under IPSO object `3311` (an array of light control instances) and dimmer resource `5851` (dimmer level `0..254`). 

The application property exposes a clean percentage scale (`0..100%`). On read, `map:proc: "pick"` extracts the nested integer value `3311[0].5851` before numeric scaling is applied. On write, the percentage is scaled back to `0..254`, rounded, and `map:proc: "wrap"` constructs the required nested JSON envelope `{"3311": [{"5851": "$value"}]}` for the CoAP payload.

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
              { "map:proc": "pick", "map:path": "3311[0].5851" },
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
- `map:proc: "pick"` extracts the nested IPSO resource `5851` from array element `3311[0]` out of the complex CoAP JSON response on read.
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

### Example 3: Bitfield to Structured Status Object for a Variable Frequency Drive

The Siemens SINAMICS V20 variable frequency drive communicates over Modbus RTU and packs discrete drive status flags and operating codes into 16-bit status registers (such as holding register `40110`). 

This example decomposes a 16-bit status register into an application-level object containing `alarm` (bit 0), `running` (bit 1), and a 2-bit numeric `modeCode` (bits 2–3). On read, `map:proc: "bitExtract"` unpacks the register integer into structured properties. On write, `map:proc: "bitCompose"` packs the fields back into the single 16-bit integer expected by the drive.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:sinamics-v20-1",
  "title": "SiemensSinamicsV20",
  "properties": {
    "status": {
      "title": "Drive Status",
      "type": "object",
      "properties": {
        "alarm": { "type": "boolean" },
        "running": { "type": "boolean" },
        "modeCode": { "type": "integer", "minimum": 0, "maximum": 3 }
      },
      "required": ["alarm", "running", "modeCode"],
      "forms": [
        {
          "href": "modbus://v20-drive.local/holding-register/40110",
          "contentType": "application/octet-stream",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:proc": "bitExtract",
                "map:fields": [
                  { "map:name": "alarm", "map:mask": 1, "map:shift": 0, "map:type": "boolean" },
                  { "map:name": "running", "map:mask": 2, "map:shift": 1, "map:type": "boolean" },
                  { "map:name": "modeCode", "map:mask": 12, "map:shift": 2, "map:type": "integer" }
                ]
              }
            ],
            "map:toWire": [
              {
                "map:proc": "bitCompose",
                "map:fields": [
                  { "map:name": "alarm", "map:mask": 1, "map:shift": 0, "map:type": "boolean" },
                  { "map:name": "running", "map:mask": 2, "map:shift": 1, "map:type": "boolean" },
                  { "map:name": "modeCode", "map:mask": 12, "map:shift": 2, "map:type": "integer" }
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
- `map:proc: "bitExtract"` unpacks a single Modbus integer into a structured application object on read (e.g., wire value `13` / `0b1101` yields `alarm=true`, `running=false`, and `modeCode=3`).
- `map:proc: "bitCompose"` explicitly packs structured object properties back into an integer for the write pipeline.
- The masks `1`, `2`, and `12` are disjoint and non-overlapping, so each bit belongs to exactly one logical field.

### Example 4: Bitfield With Enum Conversion for an HVAC Heat Pump

The Daikin Altherma heat pump with Modbus interface communicates system status through 16-bit holding registers (such as register `40001`). The register packs boolean flags for `alarm` (bit 0) and `running` (bit 1) together with a 2-bit integer `modeCode` (`0`, `1`, `2` at bits 2–3).

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
                  { "map:name": "modeCode", "map:mask": 12, "map:shift": 2, "map:type": "integer" }
                ]
              },
              {
                "map:proc": "enum",
                "map:mapFrom": "modeCode",
                "map:mapTo": "mode",
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
                "map:mapFrom": "mode",
                "map:mapTo": "modeCode",
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
                  { "map:name": "modeCode", "map:mask": 12, "map:shift": 2, "map:type": "integer" }
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
- The read pipeline first extracts the bitfield into discrete fields with `map:proc: "bitExtract"`, then maps the extracted `modeCode` integer to the application-level `mode` string enum with `map:proc: "enum"`.
- The write pipeline executes the inverse sequence: reverse enum mapping from `mode` to `modeCode`, followed by `map:proc: "bitCompose"` to pack the fields into the 16-bit Modbus integer.
- `map:mapFrom` and `map:mapTo` allow the enum step to transform one field within a structured object while leaving the other fields (`alarm`, `running`) untouched.

---

## Binding Comparison

### node-wot

The node-wot data-mapping approach supports selecting a part of a JSON payload for a Thing. This corresponds to the `pick` pattern. The proposed `map` vocabulary generalizes that behavior with explicit reverse placement, wrapping, array access, and bitfield operators, while retaining deterministic path semantics.

### PROFINET

The PROFINET binding defines `profv:payloadMapping` and related byte/bit position terms for mapping complex data types. Its structural concepts are protocol-aware and remain useful for describing payload layout. The general mapping model corresponds as follows:

| PROFINET term | General relation |
|---|---|
| `profv:payloadMapping` | `map:valueMapping` structural pipeline |
| `profv:byteOffset` / `profv:byteLength` | Binding wire-layout metadata before structural conversion |
| `profv:bitOffset` / `profv:bitlength` | `map:mask` and `map:shift` conceptually, with binding-specific byte layout retained |

The general operators should not replace byte order, byte offsets, or native PROFINET type declarations.

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

---

## Conformance Test Intent

A minimal implementation should provide tests for:

- `pick` success and missing-path behavior for `error`, `null`, and `default`.
- `place` creation of intermediate containers and rejection of path collisions.
- `wrap` placeholder count validation and `unwrap` envelope extraction.
- `at` and `setAt` valid, negative, fractional, and out-of-range indexes.
- `bitExtract` with boolean and integer fields.
- `bitCompose` round-trip behavior and missing-field rejection.
- Zero-mask, negative-shift, overlapping-mask, and field-overflow rejection.
- Combined structural, numeric, and enum processing order.
- Writable mappings that require explicit reconstruction rules.
- Preservation of operation order in both direction lists.

## Suggested Next Steps

1. Review the provisional operator names and path syntax against existing WoT vocabulary conventions.
2. Define whether `map:path` should support only object keys and array indexes or a larger standardized selector language.
3. Decide whether `map:targetTemplate` belongs in `place` or should be represented by a separate initialization operator.
4. Align `map:bitExtract` and `map:bitCompose` with binding-specific byte-order and integer-width metadata.
5. Add interoperable test vectors for envelope conversion, array updates, bitfield round trips, and combined enum conversion.
6. Validate compatibility with node-wot data mapping and relevant Binding Template payload-mapping mechanisms.
