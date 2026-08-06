# Data Mapping Operations with QUDT

This document revisits the proposal in `analysis-data-mapping-operations.md` for use case 3 (Basic Mathematical Operations) and use case 4 (Simple Type Conversion / enum mapping) from `analysis-data-mapping.md`.

The goal is to evaluate whether the existing QUDT ontologies can be used instead of the proprietary `map` context that was introduced there, and to formulate TD examples and a reusable JSON-LD context accordingly.

## Executive Summary

QUDT can replace a substantial part of the custom vocabulary, but not all of it.

What QUDT can cover well:
- quantity semantics via `qudt:hasQuantityKind`
- unit semantics via `qudt:hasUnit`
- unit conversion metadata via `qudt:conversionMultiplier`, `qudt:conversionOffset`, and `qudt:scalingOf`
- scale semantics via `qudt:RatioScale`, `qudt:IntervalScale`, `qudt:NominalScale`, `qudt:OrdinalScale`
- enumeration structures via `qudt:Enumeration`, `qudt:TaggedEnumeration`, `qudt:EnumeratedValue`, together with `dtype:code` and `dtype:literal`

What QUDT does not fully cover:
- a TD-specific directional pipeline such as `fromWire` and `toWire`
- explicit operation sequencing (`mul` then `round` then `clamp`)
- arbitrary protocol-encoding transforms that are not genuine unit conversions
- write/read inversion rules and validation semantics specific to TD data mapping

Conclusion:
- For use case 3, QUDT is a strong fit when the transform is really a unit or quantity conversion.
- For use case 4, QUDT can model enumerations and code-to-literal mappings for exact enum conversions.
- QUDT does not by itself replace the full custom TD mapping pipeline for arbitrary transport encodings.

## Relevant QUDT Capabilities

From the QUDT overview and schema/catalog pages:

- QUDT provides core classes for `qudt:Quantity`, `qudt:QuantityKind`, `qudt:QuantityValue`, and `qudt:Unit`.
- QUDT provides conversion metadata on units via `qudt:conversionMultiplier` and `qudt:conversionOffset`.
- QUDT explicitly states that unit conversion proceeds through SI reference units using the published multipliers and offsets.
- QUDT provides unit vocabularies such as `unit:DEG_C` and `unit:PERCENT`, and quantity-kind vocabularies such as `quantitykind:Temperature` and `quantitykind:DimensionlessRatio`.
- QUDT provides data/scale concepts such as `qudt:RatioScale`, `qudt:IntervalScale`, `qudt:NominalScale`, and `qudt:OrdinalScale`.
- QUDT provides enumeration concepts such as `qudt:Enumeration`, `qudt:TaggedEnumeration`, `qudt:EnumeratedValue`, plus `dtype:code` and `dtype:literal` for coded enumerated values.

These existing concepts make QUDT directly relevant to challenge 3 and partly relevant to challenge 4.

## Mapping QUDT to Use Case 3

### Where QUDT fits well

QUDT is a good replacement for the custom `mul` and `add` proposal when the mapping is actually a conversion between compatible units.

Examples:
- Kelvin on the wire to degree Celsius in the application
- unitless ratio on the wire to percent in the application
- meters on the wire to kilometers in the application

Why it works:
- `qudt:conversionMultiplier` captures multiplicative conversion.
- `qudt:conversionOffset` captures affine conversion with offset.
- `qudt:scalingOf` and `qudt:hasQuantityKind` anchor the conversion semantically.
- `qudt:RatioScale` versus `qudt:IntervalScale` helps clarify whether offsets matter semantically.

### Where QUDT does not fit well

QUDT is not a good replacement when the mathematical operation is only a protocol encoding trick rather than a unit conversion.

Examples:
- wire byte `0..255` interpreted as `0..100` brightness percent
- arbitrary sensor-specific linear calibration that is not standardized as a unit relation
- protocol-specific clamping or rounding rules

Why not:
- QUDT conversion metadata belongs to units and quantity semantics, not to ad hoc per-form transport encodings.
- QUDT does not define a TD execution model with ordered processing steps.

### Recommended usage pattern for use case 3

Use QUDT directly when:
- the application value and the wire value denote the same quantity kind, and
- the difference is only the unit or scale representation.

Keep a TD-specific mapping layer when:
- the transformation is not a standardized unit conversion, or
- deterministic sequencing such as `round` and `clamp` is required.

## Mapping QUDT to Use Case 4

### Where QUDT fits well

QUDT can model exact enum mappings when the wire uses stable codes and the application uses semantic labels.

Relevant QUDT concepts:
- `qudt:Enumeration`
- `qudt:TaggedEnumeration`
- `qudt:EnumeratedValue`
- `dtype:code`
- `dtype:literal`

This allows a TD to point to an enumeration in which each enumerated value carries:
- a wire code via `dtype:code`, and
- an application-facing label via `dtype:literal`.

This is a good match for exact one-to-one enum mapping such as:
- `0` => `closed`
- `1` => `open`
- `2` => `jammed`

### Limits for use case 4

QUDT still does not define all TD-specific behaviors around enum mapping:
- no explicit `fromWire` / `toWire` direction keys
- no normative inversion policy for non-bijective mappings
- no TD-specific error behavior for unknown codes

For exact enum mappings, these gaps are relatively small because the intended runtime behavior can often be inferred from `dtype:code` and `dtype:literal`.

For range-based enum mapping, QUDT is not a direct replacement for the custom operation pipeline.

## Overall Recommendation

1. Reuse QUDT for quantity, unit, scale, encoding, and exact enumeration semantics.
2. Avoid inventing custom `mul` and `add` terms when the mapping is actually a unit conversion already expressible in QUDT.
3. Keep a thin TD-specific mapping layer only for the cases QUDT does not cover: directionality, sequencing, rounding, clamping, and arbitrary encoding transforms.
4. Prefer QUDT enumeration structures over custom `wire/app` value maps when the mapping is a stable coded vocabulary.

## Proposed TD-Friendly QUDT Context

No reusable JSON-LD context document was identified in the reviewed QUDT overview or catalog pages specifically for TD embedding. However, QUDT publishes stable schema and vocabulary base URIs. Therefore, a TD-friendly wrapper context can be formulated that reuses existing QUDT IRIs without inventing new semantics.

The following context is illustrative:

```json
{
  "@context": {
    "@version": 1.1,

    "qudt": "http://qudt.org/schema/qudt/",
    "unit": "http://qudt.org/vocab/unit/",
    "quantitykind": "http://qudt.org/vocab/quantitykind/",
    "datatype": "http://qudt.org/vocab/datatype/",
    "dtype": "http://www.linkedmodel.org/schema/dtype#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",

    "hasQuantityKind": {
      "@id": "qudt:hasQuantityKind",
      "@type": "@id"
    },
    "hasUnit": {
      "@id": "qudt:hasUnit",
      "@type": "@id"
    },
    "unitForQuantityKind": {
      "@id": "qudt:unitForQuantityKind",
      "@type": "@id"
    },
    "applicableUnit": {
      "@id": "qudt:applicableUnit",
      "@type": "@id"
    },
    "scaleType": {
      "@id": "qudt:scaleType",
      "@type": "@id"
    },
    "byteOrder": {
      "@id": "qudt:byteOrder",
      "@type": "@id"
    },
    "dataEncoding": {
      "@id": "qudt:dataEncoding",
      "@type": "@id"
    },
    "bytes": {
      "@id": "qudt:bytes",
      "@type": "xsd:integer"
    },
    "length": {
      "@id": "qudt:length",
      "@type": "xsd:integer"
    },
    "conversionMultiplier": {
      "@id": "qudt:conversionMultiplier",
      "@type": "xsd:decimal"
    },
    "conversionOffset": {
      "@id": "qudt:conversionOffset",
      "@type": "xsd:decimal"
    },
    "scalingOf": {
      "@id": "qudt:scalingOf",
      "@type": "@id"
    },
    "enumeration": {
      "@id": "qudt:enumeration",
      "@type": "@id"
    },
    "element": {
      "@id": "qudt:element",
      "@container": "@set",
      "@type": "@id"
    },
    "dtypeCode": {
      "@id": "dtype:code",
      "@type": "xsd:string"
    },
    "dtypeLiteral": {
      "@id": "dtype:literal",
      "@type": "xsd:string"
    }
  }
}
```

Notes:
- This context does not create a new semantic model. It only aliases existing QUDT and DTYPE IRIs for convenient TD authoring.
- The context can be embedded inline in a TD or published as a separate JSON-LD context document.

## Example TDs Using QUDT and `map`

The examples below intentionally include both:
- **QUDT terms** for domain semantics such as quantity kind, unit, scale, and enumeration structure
- **`map` terms** for TD-specific execution semantics such as read/write direction, ordering, and explicit inversion

This makes the boundary visible:
- QUDT explains **what the value means**.
- `map` explains **how a TD runtime executes the conversion**.

### Example 1: Temperature Conversion Using QUDT Plus `map`

Use case:
- Wire value is expressed in kelvin.
- Application wants degree Celsius.
- This is a genuine unit conversion for the same quantity kind.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "qudt": "http://qudt.org/schema/qudt/",
      "unit": "http://qudt.org/vocab/unit/",
      "quantitykind": "http://qudt.org/vocab/quantitykind/",
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:temp-sensor-qudt-1",
  "title": "TempSensorQudt",
  "properties": {
    "temperature": {
      "type": "number",
      "readOnly": true,
      "qudt:hasQuantityKind": "quantitykind:Temperature",
      "qudt:hasUnit": "unit:DEG_C",
      "forms": [
        {
          "href": "coap://example.local/sensors/temp",
          "contentType": "application/octet-stream",
          "qudt:hasUnit": "unit:K",
          "map:valueMapping": {
            "map:fromWire": [
              { "map:op": "add", "map:value": -273.15 }
            ],
            "map:toWire": [
              { "map:op": "add", "map:value": 273.15 }
            ]
          }
        }
      ]
    }
  }
}
```

Interpretation:
- QUDT part:
  - Property-level `qudt:hasUnit` expresses the application-facing unit.
  - Form-level `qudt:hasUnit` expresses the wire unit.
  - QUDT states that `unit:DEG_C` is scaled from `unit:K` with `qudt:conversionOffset`.
- `map` part:
  - `map:fromWire` and `map:toWire` make the read/write execution path explicit for TD runtimes.
  - The ordered `add` operation is still a TD-specific execution concern rather than a QUDT concept.

### Example 2: Unitless Ratio to Percent Using QUDT Plus `map`

Use case:
- Wire value is a ratio in the range `0..1`.
- Application wants percent in the range `0..100`.
- This is a genuine unit conversion between `unit:UNITLESS` and `unit:PERCENT` for `quantitykind:DimensionlessRatio`.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "qudt": "http://qudt.org/schema/qudt/",
      "unit": "http://qudt.org/vocab/unit/",
      "quantitykind": "http://qudt.org/vocab/quantitykind/",
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:battery-level-qudt-1",
  "title": "BatteryLevelQudt",
  "properties": {
    "batteryLevel": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "qudt:hasQuantityKind": "quantitykind:DimensionlessRatio",
      "qudt:hasUnit": "unit:PERCENT",
      "forms": [
        {
          "href": "coap://example.local/power/battery",
          "contentType": "application/octet-stream",
          "qudt:hasUnit": "unit:UNITLESS",
          "map:valueMapping": {
            "map:fromWire": [
              { "map:op": "mul", "map:value": 100 }
            ],
            "map:toWire": [
              { "map:op": "mul", "map:value": 0.01 }
            ]
          }
        }
      ]
    }
  }
}
```

Interpretation:
- QUDT part:
  - `quantitykind:DimensionlessRatio`, `unit:UNITLESS`, and `unit:PERCENT` define the semantic relationship.
  - `unit:PERCENT` has `qudt:conversionMultiplier 0.01` and `qudt:scalingOf unit:UNITLESS`.
- `map` part:
  - `map:fromWire` and `map:toWire` make the conversion direction explicit.
  - The runtime does not need to guess whether the factor should be applied on read or write.

### Example 3: Exact Enum Mapping Using QUDT Tagged Enumeration Plus `map`

Use case:
- Wire protocol exposes stable numeric status codes.
- Application wants semantic strings.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "qudt": "http://qudt.org/schema/qudt/",
      "dtype": "http://www.linkedmodel.org/schema/dtype#",
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:door-sensor-qudt-1",
  "title": "DoorSensorQudt",
  "properties": {
    "doorState": {
      "type": "string",
      "enum": ["closed", "open", "jammed"],
      "readOnly": true,
      "qudt:scaleType": "qudt:NominalScale",
      "qudt:enumeration": {
        "@id": "urn:example:enum:door-state",
        "@type": "qudt:TaggedEnumeration",
        "qudt:element": [
          {
            "@id": "urn:example:enum:door-state:closed",
            "@type": "qudt:EnumeratedValue",
            "dtype:code": "0",
            "dtype:literal": "closed"
          },
          {
            "@id": "urn:example:enum:door-state:open",
            "@type": "qudt:EnumeratedValue",
            "dtype:code": "1",
            "dtype:literal": "open"
          },
          {
            "@id": "urn:example:enum:door-state:jammed",
            "@type": "qudt:EnumeratedValue",
            "dtype:code": "2",
            "dtype:literal": "jammed"
          }
        ]
      },
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
            ],
            "map:toWire": [
              {
                "map:op": "enum",
                "map:map": [
                  { "map:app": "closed", "map:wire": 0 },
                  { "map:app": "open", "map:wire": 1 },
                  { "map:app": "jammed", "map:wire": 2 }
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
- QUDT part:
  - `qudt:TaggedEnumeration`, `qudt:EnumeratedValue`, `dtype:code`, and `dtype:literal` define the stable coded vocabulary.
  - `qudt:scaleType` clarifies that this is a nominal classification.
- `map` part:
  - `map:fromWire` and `map:toWire` make the operational lookup explicit in both directions.
  - TD runtimes still need this layer for deterministic inversion and error handling.

## Minimal Additional `map` Terms Still Needed

Even when QUDT is used wherever possible, the following `map` concepts remain useful additions:
- `map:valueMapping`
- `map:fromWire`
- `map:toWire`
- `map:op`
- `map:value`
- `map:map`
- `map:wire`
- `map:app`

These are not replacements for QUDT. They are orchestration terms that tell a TD runtime how to apply the semantics that QUDT provides.

## What Still Requires a TD-Specific Mapping Layer

The following cases are not fully solved by QUDT alone:

1. Ordered operation pipelines
   - Example: multiply, then round, then clamp.

2. Arbitrary transport encodings
   - Example: a brightness byte `0..255` interpreted as application percent `0..100` when the wire value is not modeled as a proper unit conversion.

3. Explicit directionality
   - TD runtimes still need to know whether a rule applies on read, write, or both.

4. Validation and error policy
   - Unknown enum code handling, overlap checks, non-invertible write policy.

For these cases, a thin TD-specific layer still adds value even if QUDT provides the underlying semantics.

## Recommended Revision to the Earlier Proposal

Instead of making the custom `map` context the primary model for use cases 3 and 4:

1. Use QUDT as the primary vocabulary for:
   - quantity kinds
   - units
   - conversion factors and offsets
   - scale types
   - exact tagged enumerations

2. Restrict any new TD-specific vocabulary to the missing orchestration concerns only:
   - `fromWire`
   - `toWire`
   - operation sequencing when QUDT is insufficient
   - validation/error behavior

3. Prefer direct QUDT modeling whenever the transformation is semantically a unit conversion rather than a transport-specific arithmetic trick.

## Final Assessment

QUDT is not a full replacement for the entire proprietary context proposed in `analysis-data-mapping-operations.md`, but it can replace a large and important subset of it.

Most importantly:
- use case 3 should use QUDT first for genuine unit and quantity conversions
- use case 4 can use QUDT enumerations for exact coded enums
- only the remaining TD-specific execution semantics should require a custom extension

This produces a cleaner architecture:
- QUDT provides the domain semantics.
- TD provides the interaction model.
- A minimal TD extension, if still needed, provides only execution semantics not already covered by QUDT.