# Data Mapping Operations Analysis

This document consolidates findings for challenge 3 (Basic Mathematical Operations) and challenge 4 (Simple Type Conversion / enum mapping) from `analysis-data-mapping.md`.

## Goal

Define an interoperable, implementation-friendly way to express value-level transformations between application data and protocol message data, without introducing protocol-specific vocabularies in TD core.

## Recommendation Summary

1. Include challenge 4 together with challenge 3 in one coherent data-mapping track.
2. Standardize a minimal declarative operation model (no embedded scripting language).
3. Make data flow direction explicit (`fromWire`, `toWire`).
4. Define strict processing order and error behavior.
5. Treat enum mapping as composable with numeric operations.

## Scope

In scope:
- Numeric value transformations (scaling, offset, rounding, clamping).
- Discrete or range-based enum mapping.
- Composition of numeric operations and enum mapping in one pipeline.

Out of scope:
- Structural payload reshaping (object wrapping, array extraction).
- Bitmasking and field packing.
- Arbitrary code execution.

## Candidate Core Operation Set

Numeric operations (phase 1):
- `mul`: multiply by constant.
- `add`: add constant.
- `round`: `floor`, `ceil`, `nearest`, `towardZero`.
- `clamp`: enforce min and/or max bounds.

Composite shortcut (optional):
- `affine`: equivalent to multiply then add.

Enum operations (phase 1):
- Exact mapping: one input value maps to one enum symbol.
- Range mapping: interval maps to one enum symbol.

## Processing Model

Each mapping declares direction explicitly:
- `fromWire`: protocol payload value to application value.
- `toWire`: application value to protocol payload value.

Default composition when both numeric and enum mappings are present:
1. `fromWire`: numeric operations first, enum mapping second.
2. `toWire`: inverse direction, with explicit policy if not perfectly invertible.

### Invertibility Rules

- If mapping is one-to-one, inverse is straightforward.
- If mapping is many-to-one (typical for ranges), writing requires one of:
  - A canonical representative value per enum symbol, or
  - Read-only semantics for that transformed view.

## Validation and Error Semantics

Normative checks should include:
- Input type must be numeric for numeric ops.
- `NaN` and infinity are invalid unless explicitly allowed.
- Division by zero invalid (if divide op is ever added).
- Overlapping enum ranges invalid.
- Uncovered range behavior must be defined (`error` or `default`).
- Operation order is normative and deterministic.

## Extended Battery Example (Challenge 3 + 4)

Use case:
- Wire protocol exposes battery level as byte `0..255`.
- Application needs both:
  - Human-readable percentage `0..100`.
  - Semantic state enum (`critical`, `low`, `medium`, `high`).

`fromWire` flow:
1. `percent = round(raw * 100 / 255)`
2. Enum mapping:
   - `0..10` => `critical`
   - `11..30` => `low`
   - `31..80` => `medium`
   - `81..100` => `high`

`toWire` flow (if writable):
- For numeric input percent:
  - `raw = round(percent * 255 / 100)` then clamp to `0..255`.
- For enum input:
  - Use canonical representatives, for example:
    - `critical` => `5`
    - `low` => `20`
    - `medium` => `55`
    - `high` => `90`
  - Then convert representative percent to raw byte.

## Why This Combined Approach

- Keeps TD core compact and understandable.
- Covers common industrial mappings without binding-specific extensions.
- Reuses one processing framework for both numeric and semantic transforms.
- Improves interoperability and testability across tooling.

## Suggested Next Steps

1. Draft TD vocabulary proposal for operation objects and direction keys.
2. Add conformance assertions for deterministic ordering and invalid configurations.
3. Create interoperable test vectors (including battery case).
4. Coordinate with Binding Templates to map existing terms (for example LoRaWAN multiplier and BACnet value maps) onto core operations.

## Thing Description Snippet Examples

The following examples are illustrative and use a provisional extension context `https://example.org/wot/data-mapping/v1` with prefix `map`.
The intent is to show how challenge 3 (math operations) and challenge 4 (enum mapping) can be represented in TD JSON.

### Example 1: Numeric Scaling and Offset (Challenge 3)

Read-only temperature value over a protocol that sends deci-degrees Celsius (`231` means `23.1 C`).

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:temp-sensor-1",
  "title": "TempSensor",
  "properties": {
    "temperature": {
      "type": "number",
      "unit": "degree celsius",
      "readOnly": true,
      "forms": [
        {
          "href": "coap://example.local/sensors/temp",
          "contentType": "application/octet-stream",
          "map:valueMapping": {
            "map:fromWire": [
              { "map:op": "mul", "map:value": 0.1 }
            ]
          }
        }
      ]
    }
  }
}
```

### Example 2: Bidirectional Numeric Mapping With Rounding and Clamping (Challenge 3)

Writable dimmer level where application sees `0..100` percent, but wire uses `0..255`.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:dimmer-1",
  "title": "Dimmer",
  "properties": {
    "brightness": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "forms": [
        {
          "href": "modbus://example.local/holding-register/17",
          "contentType": "application/octet-stream",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:op": "mul", "map:value": 0.3921568627 },
              { "map:op": "round", "map:mode": "nearest" },
              { "map:op": "clamp", "map:min": 0, "map:max": 100 }
            ],
            "map:toWire": [
              { "map:op": "mul", "map:value": 2.55 },
              { "map:op": "round", "map:mode": "nearest" },
              { "map:op": "clamp", "map:min": 0, "map:max": 255 }
            ]
          }
        }
      ]
    }
  }
}
```

### Example 3: Exact Enum Mapping (Challenge 4)

Protocol exposes integer status codes, application uses semantic enum strings.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:door-1",
  "title": "DoorSensor",
  "properties": {
    "doorState": {
      "type": "string",
      "enum": ["open", "closed", "jammed"],
      "readOnly": true,
      "forms": [
        {
          "href": "mqtt://broker.example.org/doors/1/state",
          "contentType": "application/json",
          "subprotocol": "mqtt",
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:op": "enum",
                "map:map": [
                  { "map:wire": 0, "map:app": "closed" },
                  { "map:wire": 1, "map:app": "open" },
                  { "map:wire": 2, "map:app": "jammed" }
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

### Example 4: Combined Battery Mapping (Challenge 3 + 4)

One battery byte (`0..255`) is transformed to percentage and then to semantic bands.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:battery-1",
  "title": "BatteryMonitor",
  "properties": {
    "batteryState": {
      "type": "string",
      "enum": ["critical", "low", "medium", "high"],
      "readOnly": true,
      "forms": [
        {
          "href": "coap://example.local/power/battery",
          "contentType": "application/octet-stream",
          "map:valueMapping": {
            "map:fromWire": [
              { "map:op": "mul", "map:value": 0.3921568627 },
              { "map:op": "round", "map:mode": "nearest" },
              {
                "map:op": "enumRange",
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

### Example 5: Writable Enum With Canonical Reverse Mapping (Challenge 4)

Writable battery mode where enum-to-wire mapping uses canonical representative percentages.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:battery-target-1",
  "title": "BatteryTarget",
  "properties": {
    "targetBatteryBand": {
      "type": "string",
      "enum": ["critical", "low", "medium", "high"],
      "forms": [
        {
          "href": "coap://example.local/power/target",
          "contentType": "application/octet-stream",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:op": "mul", "map:value": 0.3921568627 },
              { "map:op": "round", "map:mode": "nearest" },
              {
                "map:op": "enumRange",
                "map:ranges": [
                  { "map:min": 0, "map:max": 10, "map:app": "critical" },
                  { "map:min": 11, "map:max": 30, "map:app": "low" },
                  { "map:min": 31, "map:max": 80, "map:app": "medium" },
                  { "map:min": 81, "map:max": 100, "map:app": "high" }
                ]
              }
            ],
            "map:toWire": [
              {
                "map:op": "enum",
                "map:map": [
                  { "map:app": "critical", "map:wire": 5 },
                  { "map:app": "low", "map:wire": 20 },
                  { "map:app": "medium", "map:wire": 55 },
                  { "map:app": "high", "map:wire": 90 }
                ]
              },
              { "map:op": "mul", "map:value": 2.55 },
              { "map:op": "round", "map:mode": "nearest" },
              { "map:op": "clamp", "map:min": 0, "map:max": 255 }
            ]
          }
        }
      ]
    }
  }
}
```

## Notes for Standardization Discussion

- The examples intentionally use a placeholder extension namespace to avoid implying that term names are final.
- Processing order is explicit and deterministic.
- Challenge 4 is composable with challenge 3 rather than handled by a separate incompatible mechanism.
- Inverse mapping requirements for writable forms are made explicit.

## Mapping Architecture: TM/TD Semantics and Binding Responsibilities

- We need to handle two distinct mappings, not one:
  1. Mapping from abstract WoT model (preferably reusable TM semantics, then TD instance data) to industry-standard device models.
  2. Mapping from those industry-standard model elements to concrete protocol and payload details via WoT Bindings.

### Layered Model

1. WoT semantic layer (TM/TD):
- Defines abstract capabilities, interaction affordances, and data meaning.
- TM is preferred for reusable abstract models; TD instantiates deployment-specific endpoints and concrete forms.

2. Industry model alignment layer:
- Aligns WoT concepts to specific industry models (for example BACnet objects, OPC UA nodes, or similar domain standards).
- Uses explicit semantic mapping terms in TM/TD extensions or companion vocabularies, independent of transport.

3. Binding/protocol layer:
- Defines transport, serialization, addressing, headers/options, and wire-level transformation details.
- Uses Binding Templates and form-level metadata.

### Responsibility Split for This Proposal

- Challenge 3 (basic math operations) and challenge 4 (enum mapping) should primarily be treated as binding-level value transformations, unless an industry standard defines these conversions as intrinsic semantic rules.
- Industry semantics should not be encoded only as protocol-specific terms; they should be represented with reusable semantic mapping annotations that can be used across multiple bindings.
- TD instances should compose both concerns: semantic mapping annotations plus concrete form/binding mapping.

### Processing Pipeline

Read path:
1. Resolve WoT semantic concept from TM/TD.
2. Resolve industry model alignment (which concrete industry concept is represented).
3. Apply binding mapping to decode wire value (including math/enum transforms).

Write path:
1. Start from WoT semantic value.
2. Apply semantic mapping constraints.
3. Apply inverse binding mapping to produce protocol payload value.

### Standardization Guidance

- TD core should standardize extension points and deterministic processing behavior.
- Industry-specific conceptual mappings should be standardized in companion vocabularies and mapping conventions.
- Binding Templates should standardize transport/wire transformations and reference semantic alignment terms where needed.
- Conformance should test both semantic consistency (industry alignment layer) and deterministic wire behavior (binding layer).

### TD/TM Examples for the Responsibility Split

The snippets below are intentionally minimal and use placeholder namespaces for illustration.

#### Example A: TM (semantic layer only)

This TM declares abstract capability and semantics, without transport or wire mapping details.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/tm/v1.1",
    {
      "ex": "https://example.org/sem#"
    }
  ],
  "@type": "tm:ThingModel",
  "title": "BatteryMonitorModel",
  "properties": {
    "batteryState": {
      "type": "string",
      "enum": ["critical", "low", "medium", "high"],
      "description": "Abstract battery state exposed to applications",
      "@type": "ex:BatteryState"
    }
  }
}
```

#### Example B: TD (semantic + industry model alignment)

This TD instantiates the semantic model and links the property to an industry concept, still without protocol-specific conversion details.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "ind": "https://example.org/industry-model#"
    }
  ],
  "id": "urn:example:thing:battery-42",
  "title": "BatteryThing",
  "properties": {
    "batteryState": {
      "type": "string",
      "enum": ["critical", "low", "medium", "high"],
      "@type": "ind:BatteryLevelState"
    }
  }
}
```

#### Example C: TD form (binding/protocol layer)

This form adds concrete protocol endpoint and wire-level transformation for the same semantic property.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#",
      "ind": "https://example.org/industry-model#"
    }
  ],
  "id": "urn:example:thing:battery-42",
  "title": "BatteryThing",
  "properties": {
    "batteryState": {
      "type": "string",
      "enum": ["critical", "low", "medium", "high"],
      "@type": "ind:BatteryLevelState",
      "forms": [
        {
          "href": "coap://example.local/power/battery",
          "contentType": "application/octet-stream",
          "op": ["readproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:op": "mul", "map:value": 0.3921568627 },
              { "map:op": "round", "map:mode": "nearest" },
              {
                "map:op": "enumRange",
                "map:ranges": [
                  { "map:min": 0, "map:max": 10, "map:app": "critical" },
                  { "map:min": 11, "map:max": 30, "map:app": "low" },
                  { "map:min": 31, "map:max": 80, "map:app": "medium" },
                  { "map:min": 81, "map:max": 100, "map:app": "high" }
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

#### Example D: Same semantics with a different binding

The same semantic property and industry model mapping can be reused with a different protocol form.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#",
      "ind": "https://example.org/industry-model#"
    }
  ],
  "id": "urn:example:thing:battery-42-http",
  "title": "BatteryThingHttp",
  "properties": {
    "batteryState": {
      "type": "string",
      "enum": ["critical", "low", "medium", "high"],
      "@type": "ind:BatteryLevelState",
      "forms": [
        {
          "href": "https://api.example.org/devices/42/battery",
          "contentType": "application/json",
          "op": ["readproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:op": "enum",
                "map:map": [
                  { "map:wire": "A", "map:app": "critical" },
                  { "map:wire": "B", "map:app": "low" },
                  { "map:wire": "C", "map:app": "medium" },
                  { "map:wire": "D", "map:app": "high" }
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

Interpretation:
- Example A defines the reusable abstract semantics.
- Example B adds industry concept alignment.
- Example C and Example D show that bindings can vary independently while preserving the same semantic and industry-model-level meaning.

## JSON-LD Context Document (Provisional)

The following JSON-LD context document corresponds to the provisional `map` vocabulary used in the TD snippets above.

```json
{
  "@context": {
    "@version": 1.1,

    "map": "https://example.org/wot/data-mapping/v1#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",

    "valueMapping": "map:valueMapping",

    "fromWire": {
      "@id": "map:fromWire",
      "@container": "@set"
    },
    "toWire": {
      "@id": "map:toWire",
      "@container": "@set"
    },

    "op": "map:op",
    "value": {
      "@id": "map:value",
      "@type": "xsd:decimal"
    },
    "mode": "map:mode",
    "min": {
      "@id": "map:min",
      "@type": "xsd:decimal"
    },
    "max": {
      "@id": "map:max",
      "@type": "xsd:decimal"
    },
    "onNoMatch": "map:onNoMatch",

    "ranges": {
      "@id": "map:ranges",
      "@container": "@set"
    },
    "mapList": {
      "@id": "map:map",
      "@container": "@set"
    },

    "wire": "map:wire",
    "app": "map:app"
  }
}
```

Usage in a TD:

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    "https://example.org/wot/data-mapping/v1"
  ]
}
```

Note:
- This context remains provisional and does not define final WoT TD term names.
- `valueMapping` is intentionally modeled as an embedded object property (not as an IRI reference).
