# Data Mapping User Story 4 - Simple Type Conversion (Enum Mapping) - Summary

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

---

## User Story Summary

**Problem:** A protocol payload uses integer or string codes for finite discrete states, while an application needs semantically meaningful labels, or the reverse conversion. Examples include `0|1|2` for `closed|open|jammed`, device modes, alarm states, and status codes.

**Proposed solution:** A declarative, direction-explicit enum mapping pipeline attached at form level. Enum mapping is a composable step in the same pipeline model used for numeric and structural conversions. The pipeline runs in `fromWire` direction on read and `toWire` direction on write.

**Core operations:**
- `enum` - map an exact input value to the corresponding value on the other side of a wire/application table.
- `enumRange` - map a numeric interval to one application enum symbol.

**Key design decisions:**
- Enum mapping is a pipeline step, not a separate mechanism.
- `map:fromWire` and `map:toWire` are explicit; reverse mapping is never guessed.
- Exact enum mappings must be unambiguous. Range mappings must not overlap.
- Unknown values produce `error` by default and may use an explicit `map:onNoMatch` policy.
- A many-to-one range mapping is read-only unless a canonical representative is defined for every application value.
- Enum mapping can be composed with numeric operations, with numeric conversion preceding enum classification on read.

---

## Scope

**In scope:**
- Exact one-to-one mappings between wire values and application values.
- Mapping integer or string protocol codes to application enum symbols.
- Mapping numeric ranges to application enum symbols.
- Bidirectional exact mappings.
- Explicit canonical reverse values for writable range classifications.
- Composition with `mul`, `add`, `round`, and `clamp`.

**Out of scope:**
- Arbitrary code execution or scripting.
- Structural extraction, wrapping, and bitfield composition, which belong to user story 5.
- Numeric scaling itself, which belongs to user story 3.
- Human-readable labels that do not change the value domain; JSON Schema `title` may be sufficient when wire and application values are identical.

---

## Standard Term Evaluation

Three existing standards were evaluated to reduce the proprietary `map` surface for user story 4.

### QUDT

**Covers well:**
- Enumeration structures such as `qudt:Enumeration`, `qudt:TaggedEnumeration`, and `qudt:EnumeratedValue`.
- Stable code and literal semantics using `dtype:code` and `dtype:literal`.
- Nominal and ordinal scale descriptions.
- Reusable domain vocabularies for coded values.

**Does not cover:**
- TD form-level direction (`fromWire`, `toWire`).
- An executable table lookup operation attached to a form.
- Range-to-label mapping.
- Unknown-code behavior and TD-specific write inversion rules.

**Recommended use:** Use QUDT to describe the meaning and reusable identity of a coded vocabulary. Keep `map` for attaching and executing a concrete wire-to-application or application-to-wire conversion.

### FnO (Function Ontology)

**Covers well:**
- Abstract decode and encode functions using `fno:Function`.
- Input and output signatures using `fno:expects`, `fno:returns`, `fno:Parameter`, and `fno:Output`.
- Reusable function descriptions and ordered compositions.

**Does not cover:**
- A built-in vocabulary for enum lookup tables.
- A built-in range mapping model.
- TD form-level attachment and direction.
- No-match behavior or non-bijective write policy.

**Recommended use:** Use FnO when enum conversion logic is a reusable function or part of a larger function catalog. Keep `map:enum` and `map:enumRange` for compact, directly executable table semantics unless a shared FnO enum-function catalog is standardized.

### JSON Schema

**Covers well:**
- Application enum domains with `enum`.
- Same-domain coded values with `oneOf`, `const`, and `title`.
- Validation of the resulting application value.

**Does not cover:**
- Cross-domain conversion, such as integer wire code to string application label.
- Directional execution and ordered mapping pipelines.
- Reverse mapping and canonical representatives.
- Runtime behavior for unknown values.

**Recommended use:** Use JSON Schema to constrain the application-facing domain. It can replace `map:enum` when wire and application values are identical and only labels are needed, but `map` remains necessary when the domains differ or values must be transformed.

---

## Capability Matrix Summary

| Capability | QUDT | FnO | JSON Schema | Keep `map`? |
|---|---|---|---|---|
| Reusable coded vocabulary | Strong | Partial | Weak | Often no |
| Exact code-to-label semantics | Strong | Partial | Partial | Sometimes |
| Same-domain allowed values | Partial | Weak | Strong | Often no |
| Cross-domain exact mapping | Partial | Partial | Weak | Yes |
| Range-to-label mapping | Weak | Partial | Partial | Yes |
| Directional execution | Weak | Weak | Weak | Yes |
| Ordered composition with numeric operations | Weak | Strong | Weak | Yes |
| Unknown-value policy | Weak | Weak | Weak | Yes |
| Non-bijective write policy | Weak | Weak | Weak | Yes |

---

## Proprietary Context Definition

The following JSON-LD context defines the terms required for user story 4 that are not covered by QUDT, FnO, or JSON Schema. The namespace is a placeholder and the prefix `map` is used throughout this document.

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

    "onNoMatch": {
      "@id": "map:onNoMatch",
      "@type": "xsd:string"
    },

    "mapEntries": {
      "@id": "map:map",
      "@container": "@list"
    },

    "wire": "map:wire",
    "app": "map:app",

    "ranges": {
      "@id": "map:ranges",
      "@container": "@list"
    },

    "canonical": "map:canonical"
  }
}
```

**Notes:**
- `valueMapping`, `fromWire`, and `toWire` attach the directional pipeline to a TD form and preserve its order.
- `op` and the operation identifiers `enum` and `enumRange` are proprietary execution step identifiers.
- `map:map`, `map:wire`, and `map:app` describe exact mapping pairs.
- `map:ranges` describes ordered, non-overlapping numeric intervals.
- `map:canonical` is used by a range mapping when a writable application enum symbol needs a deterministic wire representative.
- QUDT terms and JSON Schema keywords are used directly alongside this context without being redefined here.

### Term Reference

#### Pipeline Attachment and Direction

| Term | Description |
|---|---|
| `map:valueMapping` | Container object attached to a TD form that holds the directional pipeline. |
| `map:fromWire` | Ordered list of operations applied when reading a protocol value. |
| `map:toWire` | Ordered list of operations applied when writing an application value. A writable form without this mapping must fail unless an unambiguous inverse is explicitly defined. |

#### Enum Operation Selector

| Term | Description |
|---|---|
| `map:proc` | String identifier for the operation executed in one pipeline step. |
| `enum` | Look up the current value in an exact wire/application table and replace it with the value from the other side. |
| `enumRange` | Find the numeric interval containing the current value and replace it with that interval's application enum symbol. |

#### Exact Enum Mapping Parameters

| Term | Used by | Description |
|---|---|---|
| `map:map` | `enum` | Ordered list of exact mapping entries. Each entry contains one `map:wire` and one `map:app` value. |
| `map:wire` | `enum` entry | Value in the protocol domain. |
| `map:app` | `enum` entry and `enumRange` entry | Value in the application domain. |
| `map:onNoMatch` | `enum`, `enumRange` | Failure policy when no entry matches. Valid values are `error` (default) and `default` when an explicit default is defined by the surrounding mapping model. |

Exact mappings must not contain duplicate wire values or duplicate application values when both directions are declared. A duplicate would make lookup or inversion ambiguous.

#### Range Mapping Parameters

| Term | Used by | Description |
|---|---|---|
| `map:ranges` | `enumRange` | Ordered list of range entries. |
| `map:min` | range entry | Inclusive lower bound of the interval. |
| `map:max` | range entry | Inclusive upper bound of the interval. |
| `map:app` | range entry | Application enum symbol returned for values in the interval. |
| `map:canonical` | range entry or reverse entry | Canonical wire value used when writing the corresponding application symbol. It must lie within the associated interval. |

Ranges must have `min <= max` and must not overlap. Boundary inclusivity must be consistent; this summary uses inclusive intervals. An uncovered input follows `map:onNoMatch`, which defaults to `error`.

#### Write-Path Policy

- An exact mapping is writable when an unambiguous reverse table is present or derivable.
- An `enumRange` mapping is many-to-one by definition. It is read-only unless every application symbol has one explicit canonical wire value.
- A runtime must not choose the midpoint, first value, last value, or any other representative implicitly.
- If the requested application symbol has no reverse mapping or canonical representative, the write must fail with `error`.

---

## Processing Model

Each mapping declares direction explicitly:

- `fromWire`: protocol value to application value.
- `toWire`: application value to protocol value.

When user story 4 is combined with user story 3, the default composition is:

1. `fromWire`: numeric operations first, then enum mapping.
2. `toWire`: reverse enum mapping first, then inverse numeric operations.

For example, a raw battery byte can first be scaled to a percentage and then classified as `critical`, `low`, `medium`, or `high`. A write of `medium` first becomes its canonical percentage and is then converted to the raw wire representation.

The operation output becomes the input to the next operation. Implementations MUST execute each direction list in document order. JSON arrays are ordered, and the JSON-LD `@list` container preserves ordered list semantics.

---

## Validation and Error Semantics

Normative checks should include:

- The input type must be compatible with the mapping entry values.
- Exact mapping entries must contain both `map:wire` and `map:app`.
- Duplicate exact keys and ambiguous reverse values are invalid.
- Range entries must be numeric, inclusive, and satisfy `min <= max`.
- Range intervals must not overlap.
- Unknown values produce `error` by default.
- `map:onNoMatch` may select an explicitly defined default policy, but implementations must not silently invent an enum value.
- A writable many-to-one mapping requires an explicit canonical representative for each application value.
- Invalid operation objects must be rejected before runtime conversion.
- Missing `map:toWire` on a writable form must result in `error` when no unambiguous inverse can be derived.
- Mapping failures should identify the direction, operation index, and unmatched value where the runtime supports structured errors.

---

## Examples

All examples include proprietary `map` terms and available standard terms where useful.

### Example 1: Exact Enum Mapping

This example is modeled on the Siemens OpenAir `GDB111.1E/MO` / `GLB111.1E/MO` Modbus RTU damper actuator documented in operating manual A6V10881141, "Damper Actuator Modbus RTU G..B111.1E/MO". The manual exposes a readable/writable holding register named `Override control` (documentation register 2, protocol address 1) with the exact enumeration `0 = Off / 1 = Open / 2 = Close / 3 = Stop / 4 = GoToMin / 5 = GoToMax`. This is a direct real-world instance of a bidirectional exact enum mapping: the wire side is a small integer code set, while the application uses the semantic strings `off`, `open`, `close`, `stop`, `goToMin`, and `goToMax`. The TD form uses a Modbus TCP gateway URI because the [current WoT Modbus binding](https://w3c.github.io/wot-binding-templates/bindings/protocols/modbus/) defines `modbus+tcp` forms; the gateway is assumed to bridge to the actuator's physical Modbus RTU connection.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "modv": "https://www.w3.org/2019/wot/modbus",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    }
  ],
  "id": "urn:example:thing:damper-actuator-1",
  "title": "DamperActuator",
  "properties": {
    "overrideControl": {
      "type": "string",
      "enum": ["off", "open", "close", "stop", "goToMin", "goToMax"],
      "forms": [
        {
          "href": "modbus+tcp://gateway.example:502/1/1",
          "contentType": "application/octet-stream",
          "modv:entity": "HoldingRegister",
          "modv:type": "xsd:unsignedShort",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:proc": "enum",
                "map:map": [
                  { "map:wire": 0, "map:app": "off" },
                  { "map:wire": 1, "map:app": "open" },
                  { "map:wire": 2, "map:app": "close" },
                  { "map:wire": 3, "map:app": "stop" },
                  { "map:wire": 4, "map:app": "goToMin" },
                  { "map:wire": 5, "map:app": "goToMax" }
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
- The application schema exposes meaningful string values while the wire value remains an integer.
- `map:enum` performs an exact lookup and rejects unknown status codes.
- No reverse table, so a runtime should invert the mapping.
- Any application value outside the declared enum fails validation or lookup.

### Example 2: Range Classification of an MQTT Battery Percentage

The Heiman `HS1CA-E` Zigbee carbon-monoxide alarm exposes `battery` (0..100%) through Zigbee2MQTT. [Zigbee2MQTT publishes device state on the `zigbee2mqtt/FRIENDLY_NAME` MQTT topic as JSON](https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html). This example models that adapter-facing payload, where the JSON battery value is already normalized, and classifies it into semantic bands. The Zigbee half-percent encoding and reserved `255` value are handled inside the adapter and are not part of this TD form.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:battery-1",
  "title": "ZigbeeMqttBatteryMonitor",
  "properties": {
    "batteryState": {
      "type": "string",
      "enum": ["critical", "low", "medium", "high"],
      "readOnly": true,
      "forms": [
        {
          "href": "mqtt://broker.example:1883/zigbee2mqtt/hs1ca-e",
          "contentType": "application/json",
          "op": ["readproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:proc": "enumRange",
                "map:ranges": [
                  { "map:min": 0, "map:max": 10, "map:app": "critical" },
                  { "map:min": 11, "map:max": 30, "map:app": "low" },
                  { "map:min": 31, "map:max": 80, "map:app": "medium" },
                  { "map:min": 81, "map:max": 100, "map:app": "high" }
                ],
                "map:onNoMatch": "error"
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
- An MQTT JSON value can be classified into application-level semantic bands.
- The enum ranges operate on the battery percentage exposed by the adapter.
- The ranges are exhaustive over the valid percentage domain and do not overlap.

### Example 3: Writable Range Mapping for MQTT Light Brightness

The IKEA LED1545G12 is a Zigbee dimmable bulb supported by Zigbee2MQTT. Its `brightness` property is writable through the JSON payload `{"brightness": VALUE}` on `zigbee2mqtt/FRIENDLY_NAME/set`, with `VALUE` documented as `0..254`; the current state is published as JSON on the device topic. This example exposes semantic brightness bands, selects one canonical percentage for each band, and converts that representative to the device's numeric brightness value. The TD uses separate read and write forms because Zigbee2MQTT publishes state on the base topic and accepts commands on `/set`.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:light-brightness-1",
  "title": "LightBrightness",
  "properties": {
    "brightnessBand": {
      "type": "string",
      "enum": ["off", "dim", "medium", "bright"],
      "forms": [
        {
          "href": "mqtt://broker.example:1883/zigbee2mqtt/ikea-led1545g12",
          "contentType": "application/json",
          "op": ["readproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:proc": "mul", "map:value": 0.3937007874 },
              { "map:proc": "round", "map:mode": "nearest" },
              {
                "map:proc": "enumRange",
                "map:ranges": [
                  { "map:min": 0, "map:max": 10, "map:app": "off", "map:canonical": 5 },
                  { "map:min": 11, "map:max": 30, "map:app": "dim", "map:canonical": 20 },
                  { "map:min": 31, "map:max": 80, "map:app": "medium", "map:canonical": 55 },
                  { "map:min": 81, "map:max": 100, "map:app": "bright", "map:canonical": 90 }
                ]
              }
            ]
          }
        },
        {
          "href": "mqtt://broker.example:1883/zigbee2mqtt/ikea-led1545g12/set",
          "contentType": "application/json",
          "op": ["writeproperty"],
          "map:valueMapping": {
            "map:toWire": [
              {
                "map:proc": "enum",
                "map:map": [
                  { "map:app": "off", "map:wire": 5 },
                  { "map:app": "dim", "map:wire": 20 },
                  { "map:app": "medium", "map:wire": 55 },
                  { "map:app": "bright", "map:wire": 90 }
                ]
              },
              { "map:proc": "mul", "map:value": 2.54 },
              { "map:proc": "round", "map:mode": "nearest" },
              { "map:proc": "clamp", "map:min": 0, "map:max": 254 }
            ]
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- A range mapping is not inherently invertible.
- Canonical representatives make the write path deterministic, but writing a band does not restore the original percentage.
- The canonical values selected in this example are for illustration only and do not represent a recommendation; manufacturers might select other values and even more or fewer ranges that better reflect the features of their product.
- The reverse pipeline maps the canonical percentage to the Zigbee2MQTT brightness value after enum classification.

### Example 4: Exact Enum Mapping for a BACnet Multistate Property

The BACnet binding example for enum mapping shows how a protocol value can be translated into a semantic application value. This same pattern can be expressed directly with the generic `map` vocabulary. The example models a BACnet multistate property whose protocol value is an integer and whose application value is a string.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:multistate-1",
  "title": "BACnetMultistateProperty",
  "properties": {
    "multistate1": {
      "type": "string",
      "enum": ["on", "off", "auto", "manual"],
      "readOnly": true,
      "forms": [
        {
          "href": "bacnet://5/14,1/85",
          "contentType": "application/octet-stream",
          "op": ["readproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:proc": "enum",
                "map:map": [
                  { "map:wire": 1, "map:app": "on" },
                  { "map:wire": 2, "map:app": "off" },
                  { "map:wire": 3, "map:app": "auto" },
                  { "map:wire": 4, "map:app": "manual" }
                ],
                "map:onNoMatch": "error"
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
- It follows the BACnet enum-mapping pattern shown in https://w3c.github.io/wot-binding-templates/bindings/protocols/bacnet/#example-enum-mapping.
- The protocol value is represented as `map:wire`; the application value is represented as `map:app`.
- `map:proc: "enum"` performs an exact lookup from protocol values to semantic strings.
- The mapping is explicit and directional; an unknown BACnet state is rejected unless a different `map:onNoMatch` policy is defined.

### Example 5: Bitfield Mapping for a PROFINET Complex Datatype

The PROFINET binding example for a complex datatype shows how a bitfield within a larger protocol payload can be decoded into meaningful boolean values. The same pattern can be expressed directly with the generic `map` vocabulary by treating each encoded bit as an exact enum lookup. This example models two boolean flags from the same PROFINET payload.

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "profv": "https://profinet_vocabulary_context"
    }
  ],
  "id": "urn:example:thing:profinet-boolean-flags",
  "title": "PROFINETBooleanFlags",
  "profv:deviceId": 12,
  "profv:vendorId": 268,
  "securityDefinitions": {
    "nosec_sc": {
      "scheme": "nosec"
    }
  },
  "security": "nosec_sc",
  "properties": {
    "bufferingParameters": {
      "title": "Buffering parameters",
      "type": "object",
      "properties": {
        "bufferingAllowed": {
          "type": "boolean"
        },
        "enableResetAfterBuffering": {
          "type": "boolean"
        }
      },
      "forms": [
        {
          "op": [
            "writeproperty",
            "readproperty"
          ],
          "href": "profinet://127.0.0.1/0/1?api=0&index=1&datalength=14",
          "contentType": "application/octet-stream",
          "profv:type": "object",
          "profv:pollingTime": 200,
          "profv:payloadMapping": {
            "bufferingAllowed": {
              "profv:type": "boolean",
              "profv:byteOffset": 12,
              "profv:byteLength": 1,
              "profv:bitOffset": 0,
              "map:valueMapping": {
                "map:fromWire": [
                  {
                    "map:proc": "enum",
                    "map:map": [
                      {
                        "map:wire": 0,
                        "map:app": false
                      },
                      {
                        "map:wire": 1,
                        "map:app": true
                      }
                    ],
                    "map:onNoMatch": "error"
                  }
                ]
              }
            },
            "enableResetAfterBuffering": {
              "profv:type": "boolean",
              "profv:byteOffset": 13,
              "profv:byteLength": 1,
              "profv:bitOffset": 0,
              "map:valueMapping": {
                "map:fromWire": [
                  {
                    "map:proc": "enum",
                    "map:map": [
                      {
                        "map:wire": 0,
                        "map:app": false
                      },
                      {
                        "map:wire": 1,
                        "map:app": true
                      }
                    ],
                    "map:onNoMatch": "error"
                  }
                ]
              }
            }
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- It follows the PROFINET complex-datatype pattern shown in https://w3c.github.io/wot-binding-templates/bindings/protocols/profinet/#example-complex-datatype.
- The encoded bit values are modeled as `map:wire`, while the semantic boolean values are modeled as `map:app`.
- `map:proc: "enum"` maps each encoded flag value to a boolean application value.
- The example shows how a protocol-specific bitfield can still be represented with the generic `map` vocabulary when the semantic values are discrete and exact.

---

## Binding Comparison

### LoRaWAN

The LoRaWAN binding defines protocol-specific enum support such as `lorav:enum`, as well as discriminator and conditional terms. The direct general equivalent is:

| LoRaWAN term | Purpose | General `map` equivalent |
|---|---|---|
| `lorav:enum` | Map raw integer or string code to a semantic label | `map:proc: "enum"` with `map:map` |
| `lorav:switchField` / `lorav:switchValue` | Select a payload case using a discriminator | Outside simple enum mapping; requires structural conditional support |
| `lorav:guard` | Select a value conditionally | Outside simple enum mapping; requires a conditional operation |

`lorav:enum` can be aligned directly with `map:enum` when the binding's value table is exact and directionality is made explicit. Conditional payload selection remains outside user story 4.

### Modbus

The Modbus binding defines no binding-specific enum conversion vocabulary in the reviewed material. Its terms select the Modbus function, entity, address, quantity, and wire representation. A Modbus register containing a code therefore needs the general `map:enum` pipeline when the application should receive a semantic string instead of the raw numeric code.

### BACnet

The BACnet binding provides `bacv:hasValueMap`, `bacv:hasMapEntry`, `bacv:hasProtocolVal`, and `bacv:hasLogicalVal` for protocol-to-logical value mappings. These correspond closely to `map:enum`:

| BACnet term | Purpose | General `map` equivalent |
|---|---|---|
| `bacv:hasValueMap` | Value mapping container | `map:map` |
| `bacv:hasMapEntry` | One mapping entry | One `map:map` item |
| `bacv:hasProtocolVal` | Protocol-side value | `map:wire` |
| `bacv:hasLogicalVal` | Application/logical value | `map:app` |

The BACnet terms remain useful for BACnet-specific descriptions, while `map:enum` supplies a protocol-independent execution model and explicit no-match/write behavior.

### PROFINET

The PROFINET binding's `profv:enumeratedValue`, `profv:encodedPayload`, and `profv:decodedPayload` describe encoded and decoded enum-like values. They can provide binding-specific type and payload metadata, but they do not replace the general directional pipeline or its runtime policies.

| PROFINET term | Purpose | General `map` relation |
|---|---|---|
| `profv:enumeratedValue` | Declare an enumerated value | Application enum/domain annotation |
| `profv:encodedPayload` | Encoded protocol representation | `map:wire` side of an exact mapping |
| `profv:decodedPayload` | Decoded application representation | `map:app` side of an exact mapping |

---

## Role of `map` Terms as Default and Fallback for Binding Implementations

### Two valid homes for the same term

A binding may define a protocol-specific value-map vocabulary, while the generic `map` vocabulary defines the same concept in a protocol-independent form. Both can be valid:

1. The binding term can preserve protocol-specific data types, addressing, and vocabulary conventions.
2. The `map` term can provide common execution semantics for exact lookup, range lookup, direction, ordering, and errors.

### `map` as a default and fallback

When a binding-specific enum term is semantically equivalent to `map:enum`, a Consumer or Exposer may delegate processing to the common enum implementation. A new binding can also reuse `map:enum` directly rather than define a duplicate code-to-label mechanism.

This does not make binding-specific terms meaningless. They may still be required to describe protocol-native concepts or to retain compatibility with existing TDs. The correspondence should be documented, and any binding-specific constraints must be applied before or alongside the generic enum operation as appropriate.

### Practical implications

- One exact-map implementation can support BACnet, LoRaWAN, PROFINET, Modbus, and other bindings.
- Unknown-code and ambiguous-reverse errors can have uniform semantics across bindings.
- Existing binding vocabularies can migrate incrementally by documenting an equivalence to `map:enum`.
- Range mappings should remain explicit because they are not represented by ordinary exact enum tables and require a write policy.
