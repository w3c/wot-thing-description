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
  "id": "urn:example:thing:battery-profile-1",
  "title": "BatteryProfile",
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
