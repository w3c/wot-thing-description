# Data Mapping Operations with FnO

This document revisits the proposal in `analysis-data-mapping-operations.md` for use case 3 (Basic Mathematical Operations) and use case 4 (Simple Type Conversion / enum mapping) from `analysis-data-mapping.md`.

The goal is to evaluate whether the existing Function Ontology (FnO) found at `https://fno.io/spec/` can be used instead of parts of the proprietary `map` context, and to formulate TD examples and a reusable JSON-LD context accordingly.

## Executive Summary

FnO can replace an important part of the custom vocabulary, but not all of it.

What FnO can cover well:
- abstract function declarations via `fno:Function`
- parameter and output signatures via `fno:expects`, `fno:returns`, `fno:Parameter`, `fno:Output`, `fno:predicate`, `fno:type`, `fno:required`
- explicit assignment/execution model via `fno:Execution` and `fno:executes`
- partial application of constants via `fnoc:PartiallyAppliedFunction`, `fnoc:parameterBinding`, `fnoc:boundParameter`, `fnoc:boundToTerm`
- ordered composition of reusable functions via `fnoc:Composition`, `fnoc:composedOf`, `fnoc:mapFrom`, `fnoc:mapTo`, `fnoc:functionParameter`, and `fnoc:functionOutput`

What FnO does not cover well by itself:
- a built-in catalog of arithmetic operations such as `mul`, `add`, `round`, `clamp`
- a built-in vocabulary for enum lookup tables such as `wire => app`
- TD-specific attachment points such as `fromWire` and `toWire`
- TD-specific validation and inversion policy for write paths

Conclusion:
- For use case 3, FnO is a strong fit for describing reusable transformation functions and their composition.
- For use case 4, FnO can describe encode/decode functions abstractly, but it does not by itself define the actual value table semantics that `map:enum` currently provides.
- A reduced `map` layer is still needed for TD-specific orchestration and, in some cases, for concrete mapping-table semantics.

## Relevant FnO Capabilities

From the FnO specification:

- `fno:Function` models an implementation-independent function.
- `fno:Parameter` and `fno:Output` describe function signatures.
- `fno:expects` and `fno:returns` define ordered parameter/output lists.
- `fno:Execution` models the assignment of values to a function.
- `fnoc:PartiallyAppliedFunction` allows binding constants to parameters.
- `fnoc:Composition` allows composing multiple functions into a pipeline.
- `fno:Mapping`, `fnom:*`, and `fnoi:*` relate abstract functions to concrete implementations, if needed.

These capabilities are directly relevant to challenge 3 and partially relevant to challenge 4 because they model transformation logic as functions rather than as inline operation objects.

## Mapping FnO to Use Case 3

### Where FnO fits well

FnO is a good fit for expressing reusable mathematical transformations as explicit functions.

Examples:
- a generic multiply function with two parameters
- a partially applied multiply-by-0.1 function
- a composed brightness-decoding function made from scaling, rounding, and clamping

Why it works:
- `fno:Function` models the operation itself.
- `fno:Parameter` and `fno:Output` define a machine-readable signature.
- `fnoc:PartiallyAppliedFunction` replaces inline constants such as `map:value`.
- `fnoc:Composition` can describe ordered execution without inventing a new composition vocabulary.

### Where FnO does not fit well

FnO does not itself standardize the primitive operation catalog.

Examples of missing built-ins:
- no standard `fno:Multiply`
- no standard `fno:RoundNearest`
- no standard `fno:Clamp`

Why not:
- FnO is an ontology for describing functions, not a domain vocabulary of mathematical primitives.
- To use FnO interoperably, either:
  - a shared library of function identifiers must be defined, or
  - a TD-specific vocabulary such as `map:op` must still identify the primitive operations.

### Recommended usage pattern for use case 3

Use FnO directly when:
- the main challenge is to describe reusable functions, constants, and ordered composition.

Keep `map` when:
- the TD needs explicit form-level direction (`fromWire`, `toWire`), or
- the ecosystem still relies on a compact built-in operation vocabulary instead of shared FnO function catalogs.

## Mapping FnO to Use Case 4

### Where FnO fits well

FnO can describe encode and decode functions for enumerations.

Relevant FnO concepts:
- `fno:Function`
- `fno:expects`
- `fno:returns`
- `fno:Parameter`
- `fno:Output`

This means a TD can reference an abstract function such as:
- `decodeDoorState(code) -> label`
- `encodeDoorState(label) -> code`

### Where FnO does not fit well

FnO does not provide the concrete value-table semantics itself.

Missing pieces:
- no built-in `wire/app` pair vocabulary
- no built-in range-to-label mapping model
- no built-in no-match policy

Therefore, FnO can describe that a decode function exists, but not, by itself, the exact mapping table in a compact interoperable form.

## Overall Recommendation

1. Reuse FnO for function signatures, partial applications, and composition.
2. Keep a small `map` layer for TD attachment and direction (`valueMapping`, `fromWire`, `toWire`).
3. Keep `map` also for concrete enum table semantics unless a shared FnO-based function catalog for enum mappings is standardized.
4. Consider FnO a good replacement for the orchestration of transformations, but not for all primitive or tabular semantics.

## Proposed TD-Friendly FnO Context

No TD-specific JSON-LD context was identified in the reviewed FnO spec. The FnO specification does publish stable namespaces for the core ontology and companion vocabularies, so a TD-friendly wrapper context can be formulated that reuses these IRIs directly.

The following context is illustrative:

```json
{
  "@context": {
    "@version": 1.1,

    "fno": "https://w3id.org/function/ontology#",
    "fnoc": "https://w3id.org/function/vocabulary/composition#",
    "fnom": "https://w3id.org/function/vocabulary/mapping#",
    "fnoi": "https://w3id.org/function/vocabulary/implementation#",
    "map": "https://example.org/wot/data-mapping/v1#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "ex": "urn:example:fno:",

    "expects": {
      "@id": "fno:expects",
      "@container": "@list",
      "@type": "@id"
    },
    "returns": {
      "@id": "fno:returns",
      "@container": "@list",
      "@type": "@id"
    },
    "predicate": {
      "@id": "fno:predicate",
      "@type": "@id"
    },
    "fnType": {
      "@id": "fno:type",
      "@type": "@id"
    },
    "required": {
      "@id": "fno:required",
      "@type": "xsd:boolean"
    },
    "executes": {
      "@id": "fno:executes",
      "@type": "@id"
    },
    "partiallyApplies": {
      "@id": "fnoc:partiallyApplies",
      "@type": "@id"
    },
    "parameterBinding": {
      "@id": "fnoc:parameterBinding",
      "@container": "@set"
    },
    "boundParameter": {
      "@id": "fnoc:boundParameter",
      "@type": "@id"
    },
    "boundToTerm": "fnoc:boundToTerm",
    "composedOf": {
      "@id": "fnoc:composedOf",
      "@container": "@set"
    },
    "mapFrom": "fnoc:mapFrom",
    "mapTo": "fnoc:mapTo",
    "constituentFunction": {
      "@id": "fnoc:constituentFunction",
      "@type": "@id"
    },
    "functionParameter": {
      "@id": "fnoc:functionParameter",
      "@type": "@id"
    },
    "functionOutput": {
      "@id": "fnoc:functionOutput",
      "@type": "@id"
    }
  }
}
```

Notes:
- This context reuses the published FnO namespaces directly.
- `map` is still present because TD examples below still need TD-specific orchestration terms.

## Example TDs Using FnO and `map`

The examples below intentionally include both:
- **FnO terms** for abstract functions, constants, and compositions
- **`map` terms** for TD-specific attachment and, where needed, concrete value-table semantics

This makes the boundary visible:
- FnO explains **which reusable transformation function exists and how it is composed**.
- `map` explains **where in the TD form read/write processing that function is applied**.

### Example 1: Numeric Scaling Using FnO Partial Application Plus `map`

Use case:
- Wire protocol sends deci-degrees Celsius (`231` means `23.1 C`).
- Application wants degrees Celsius.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "fno": "https://w3id.org/function/ontology#",
      "fnoc": "https://w3id.org/function/vocabulary/composition#",
      "map": "https://example.org/wot/data-mapping/v1#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "ex": "urn:example:fno:"
    }
  ],
  "@graph": [
    {
      "@id": "urn:example:thing:temp-sensor-fno-1",
      "id": "urn:example:thing:temp-sensor-fno-1",
      "title": "TempSensorFnO",
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
                  { "@id": "ex:multiplyByPointOne" }
                ]
              }
            }
          ]
        }
      }
    },
    {
      "@id": "ex:multiplyFunction",
      "@type": "fno:Function",
      "fno:expects": {
        "@list": [
          { "@id": "ex:rawValueParameter" },
          { "@id": "ex:factorParameter" }
        ]
      },
      "fno:returns": {
        "@list": [
          { "@id": "ex:scaledValueOutput" }
        ]
      }
    },
    {
      "@id": "ex:rawValueParameter",
      "@type": "fno:Parameter",
      "fno:predicate": { "@id": "ex:rawValue" },
      "fno:type": { "@id": "xsd:decimal" },
      "fno:required": true
    },
    {
      "@id": "ex:factorParameter",
      "@type": "fno:Parameter",
      "fno:predicate": { "@id": "ex:factor" },
      "fno:type": { "@id": "xsd:decimal" },
      "fno:required": true
    },
    {
      "@id": "ex:scaledValueOutput",
      "@type": "fno:Output",
      "fno:predicate": { "@id": "ex:scaledValue" },
      "fno:type": { "@id": "xsd:decimal" },
      "fno:required": true
    },
    {
      "@id": "ex:multiplyByPointOne",
      "@type": "fnoc:PartiallyAppliedFunction",
      "fnoc:partiallyApplies": { "@id": "ex:multiplyFunction" },
      "fnoc:parameterBinding": [
        {
          "@type": "fnoc:ParameterBinding",
          "fnoc:boundParameter": { "@id": "ex:factorParameter" },
          "fnoc:boundToTerm": 0.1
        }
      ]
    }
  ]
}
```

Interpretation:
- FnO part:
  - `fno:Function` describes a generic multiply function.
  - `fnoc:PartiallyAppliedFunction` binds the constant `0.1`.
- `map` part:
  - `map:valueMapping` and `map:fromWire` attach the function to the TD form and declare that it runs on read.

### Example 2: Ordered Numeric Pipeline Using FnO Functions Plus `map`

Use case:
- Wire byte `0..255` becomes application percent `0..100`.
- Read path: scale, round, clamp.
- Write path: inverse scale, round, clamp.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "fno": "https://w3id.org/function/ontology#",
      "fnoc": "https://w3id.org/function/vocabulary/composition#",
      "map": "https://example.org/wot/data-mapping/v1#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "ex": "urn:example:fno:"
    }
  ],
  "@graph": [
    {
      "@id": "urn:example:thing:dimmer-fno-1",
      "id": "urn:example:thing:dimmer-fno-1",
      "title": "DimmerFnO",
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
                  { "@id": "ex:scaleByteToPercent" },
                  { "@id": "ex:roundNearest" },
                  { "@id": "ex:clampPercent" }
                ],
                "map:toWire": [
                  { "@id": "ex:scalePercentToByte" },
                  { "@id": "ex:roundNearest" },
                  { "@id": "ex:clampByte" }
                ]
              }
            }
          ]
        }
      }
    },
    {
      "@id": "ex:scaleByteToPercent",
      "@type": "fnoc:PartiallyAppliedFunction",
      "fnoc:partiallyApplies": { "@id": "ex:multiplyFunction" },
      "fnoc:parameterBinding": [
        {
          "@type": "fnoc:ParameterBinding",
          "fnoc:boundParameter": { "@id": "ex:factorParameter" },
          "fnoc:boundToTerm": 0.3921568627
        }
      ]
    },
    {
      "@id": "ex:scalePercentToByte",
      "@type": "fnoc:PartiallyAppliedFunction",
      "fnoc:partiallyApplies": { "@id": "ex:multiplyFunction" },
      "fnoc:parameterBinding": [
        {
          "@type": "fnoc:ParameterBinding",
          "fnoc:boundParameter": { "@id": "ex:factorParameter" },
          "fnoc:boundToTerm": 2.55
        }
      ]
    },
    {
      "@id": "ex:roundNearest",
      "@type": "fno:Function"
    },
    {
      "@id": "ex:clampPercent",
      "@type": "fno:Function"
    },
    {
      "@id": "ex:clampByte",
      "@type": "fno:Function"
    }
  ]
}
```

Interpretation:
- FnO part:
  - reusable transformation steps are identified as functions.
  - constants are modeled as partial applications.
- `map` part:
  - the TD still needs `map:fromWire` and `map:toWire` to say which ordered steps run on read and write.
  - FnO alone does not give the TD this form-level attachment point.

### Example 3: Exact Enum Mapping Using FnO Function Signature Plus `map`

Use case:
- Wire protocol exposes integer status codes.
- Application wants semantic enum strings.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "fno": "https://w3id.org/function/ontology#",
      "map": "https://example.org/wot/data-mapping/v1#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "ex": "urn:example:fno:"
    }
  ],
  "@graph": [
    {
      "@id": "urn:example:thing:door-fno-1",
      "id": "urn:example:thing:door-fno-1",
      "title": "DoorSensorFnO",
      "properties": {
        "doorState": {
          "type": "string",
          "enum": ["closed", "open", "jammed"],
          "readOnly": true,
          "forms": [
            {
              "href": "mqtt://broker.example.org/doors/1/state",
              "contentType": "application/json",
              "subprotocol": "mqtt",
              "map:valueMapping": {
                "map:fromWire": [
                  {
                    "@id": "ex:doorStateDecode",
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
                    "@id": "ex:doorStateEncode",
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
    },
    {
      "@id": "ex:doorStateDecode",
      "@type": "fno:Function",
      "fno:expects": {
        "@list": [
          { "@id": "ex:statusCodeParameter" }
        ]
      },
      "fno:returns": {
        "@list": [
          { "@id": "ex:doorStateOutput" }
        ]
      }
    },
    {
      "@id": "ex:doorStateEncode",
      "@type": "fno:Function",
      "fno:expects": {
        "@list": [
          { "@id": "ex:doorStateParameter" }
        ]
      },
      "fno:returns": {
        "@list": [
          { "@id": "ex:statusCodeOutput" }
        ]
      }
    }
  ]
}
```

Interpretation:
- FnO part:
  - `fno:Function` describes that decode and encode functions exist and what they consume and produce.
- `map` part:
  - `map:op`, `map:map`, `map:wire`, and `map:app` still provide the concrete table semantics.
  - FnO alone does not define that compact code-to-label table.

## Minimal Additional `map` Terms Still Needed

Even when FnO is used wherever possible, the following `map` concepts remain useful additions:
- `map:valueMapping`
- `map:fromWire`
- `map:toWire`
- `map:op`
- `map:map`
- `map:wire`
- `map:app`

If a community-standard FnO function library for primitive transforms were established, `map:op` and `map:value` could be reduced further for numeric operations. However, `map:valueMapping`, `map:fromWire`, and `map:toWire` would still remain useful TD attachment terms.

## What FnO Can Replace vs. What `map` Must Keep

FnO can replace or strongly support:
- abstract operation signatures
- reusable transformation step descriptions
- constant binding through partial application
- composition of multiple steps

`map` still needs to keep:
- TD form attachment
- explicit read/write direction
- compact inline enum table semantics
- any remaining primitive-operation shorthand not standardized as shared FnO functions

## Final Assessment

FnO is not a full replacement for the proprietary `map` context proposed in `analysis-data-mapping-operations.md`, but it can replace a major part of the orchestration model.

Most importantly:
- FnO is well suited for modeling transformation logic as reusable functions.
- FnO is especially valuable for partial application and composition.
- `map` remains necessary for TD-specific integration and for compact inline value-table semantics.

This yields a clean separation:
- FnO provides reusable function semantics.
- TD provides the interaction model.
- `map` remains as a thin TD-facing glue layer where FnO does not define direct TD attachment or concise mapping tables.