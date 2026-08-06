# Data Mapping Operations with JSON Schema Terms

This document revisits the proposal in `analysis-data-mapping-operations.md` for use case 3 (Basic Mathematical Operations) and use case 4 (Simple Type Conversion / enum mapping) from `analysis-data-mapping.md`.

The goal is to evaluate how existing JSON Schema terms can be used together with `map`, potentially replacing part of the custom `map` vocabulary, and to provide TD examples that show this split explicitly.

## Executive Summary

JSON Schema can replace some `map` terms, especially where the need is to constrain or label values, but it cannot replace the full directional transformation model.

What JSON Schema can cover well:
- value set constraints (`enum`, `const`, `oneOf`)
- numeric constraints (`minimum`, `maximum`, `multipleOf`)
- conditional schema branching (`if` / `then` / `else`)
- structural constraints and validation semantics

What JSON Schema does not cover well by itself:
- explicit directional transformations (`fromWire`, `toWire`)
- ordered execution pipelines of operations
- reversible encode/decode rules
- dynamic transformations such as multiply/add/round/clamp as executable steps

Conclusion:
- JSON Schema is strong as a validation and semantic-shaping layer.
- `map` is still needed as an execution/orchestration layer.

## Where JSON Schema Can Replace `map`

### 1. Exact value sets (`map:op enum`)

For simple coded values, JSON Schema can often replace a custom mapping table when wire and application values are the same value domain and only labels are needed.

Typical replacement pattern:
- `map:op: "enum"` + `map:map` -> JSON Schema `oneOf` with `const` and `title`.

Example pattern (as requested):

```json
"basic_setting_mode": {
  "title": "Mode",
  "description": "Mode (register 1700)",
  "type": "integer",
  "readOnly": true,
  "writeOnly": false,
  "observable": true,
  "oneOf": [
    { "const": 0, "title": "State0" },
    { "const": 1, "title": "State1" },
    { "const": 2, "title": "State2" }
  ]
}
```

This is a good replacement when:
- app and wire both use numeric codes, and
- titles are sufficient for human readability.

### 2. Clamp-like restrictions (`map:op clamp`)

JSON Schema can replace part of clamp semantics as a constraint:
- `map:op: "clamp", map:min, map:max` -> `minimum` / `maximum`.

Important limitation:
- JSON Schema validates bounds but does not prescribe an automatic clamping operation.

### 3. Range categorization (partial replacement of `map:enumRange`)

JSON Schema can represent mutually exclusive ranges using `oneOf` plus numeric bounds, but this is still validation of allowed forms, not an explicit conversion step.

## Where `map` Must Remain

The following concerns still require `map` (or equivalent execution vocabulary):

1. Directionality
- `map:fromWire`
- `map:toWire`

2. Ordered transformations
- applying `mul` then `round` then `clamp`

3. Arithmetic transforms
- `map:op` = `mul`, `add`, `round` and similar execution steps

4. Cross-domain mappings
- when wire and app value domains differ (for example numeric wire code to string enum)

5. Inversion policy and write semantics
- canonical reverse value choice
- no-match handling

## Bitmap Note (About `oneOf`)

Using `oneOf` with `const` is excellent for finite coded-state enumerations.

For actual bitmaps (multiple independent flags packed into one integer), `oneOf` alone is usually not enough because:
- each bit can vary independently,
- the value space is combinatorial,
- decoding requires bit extraction logic.

So for true bitmaps:
- JSON Schema can constrain shape/range,
- but `map` (or another execution model) is still needed for bit operations.

## Recommended Split: JSON Schema + `map`

1. Use JSON Schema for declarative constraints and value-domain modeling.
2. Use `map` for executable, directional transformations.
3. Prefer replacing `map` terms only where JSON Schema preserves behavior without ambiguity.

## Context Guidance

### Do we need a dedicated JSON Schema context?

Usually no.

Reason:
- In TD, JSON Schema keywords (such as `type`, `oneOf`, `const`, `minimum`, `maximum`) are standard JSON object members and do not require a separate JSON-LD prefix mapping.

Therefore, in most TDs you only need to add context entries for extension vocabularies such as `map`.

### Optional context pattern (if explicit documentation is desired)

If you still want to document intent explicitly, you can include an auxiliary alias for the JSON Schema meta-schema URI, while still using regular JSON Schema keywords directly.

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#",
      "jsonschema": "https://json-schema.org/draft/2020-12/schema#"
    }
  ]
}
```

Note:
- `jsonschema` here is informational; the schema keywords remain plain JSON keys.

## Example TDs (JSON Schema + `map`)

The examples below make the boundary explicit:
- JSON Schema terms define constraints and readable state codings.
- `map` terms define execution behavior where needed.

### Example 1: Coded Integer States with `oneOf` (No `map:enum` needed)

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#",
      "jsonschema": "https://json-schema.org/draft/2020-12/schema#"
    }
  ],
  "id": "urn:example:thing:mode-1",
  "title": "ModeThing",
  "properties": {
    "basic_setting_mode": {
      "title": "Mode",
      "description": "Mode (register 1700)",
      "type": "integer",
      "readOnly": true,
      "writeOnly": false,
      "observable": true,
      "oneOf": [
        { "const": 0, "title": "State0" },
        { "const": 1, "title": "State1" },
        { "const": 2, "title": "State2" }
      ],
      "forms": [
        {
          "href": "modbus://example.local/holding-register/1700",
          "contentType": "application/octet-stream"
        }
      ]
    }
  }
}
```

Interpretation:
- Replaced: custom enum table for this case.
- Kept: no `map` needed here because no value transformation is performed.

### Example 2: Numeric Scaling Still Needs `map`, Constraints in JSON Schema

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#",
      "jsonschema": "https://json-schema.org/draft/2020-12/schema#"
    }
  ],
  "id": "urn:example:thing:temp-2",
  "title": "TempThing",
  "properties": {
    "temperature": {
      "type": "number",
      "minimum": -40,
      "maximum": 125,
      "multipleOf": 0.1,
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

Interpretation:
- JSON Schema handles constraints (`minimum`, `maximum`, `multipleOf`).
- `map` still handles executable scaling.

### Example 3: Enum Labels as Strings Still Need `map` for Conversion

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#",
      "jsonschema": "https://json-schema.org/draft/2020-12/schema#"
    }
  ],
  "id": "urn:example:thing:door-3",
  "title": "DoorThing",
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
- JSON Schema `enum` defines allowed application strings.
- `map` still defines wire-to-app and app-to-wire conversion.

### Example 4: Range Classification with JSON Schema Guardrails + `map` Execution

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#",
      "jsonschema": "https://json-schema.org/draft/2020-12/schema#"
    }
  ],
  "id": "urn:example:thing:battery-4",
  "title": "BatteryThing",
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
    },
    "batteryPercent": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "multipleOf": 1,
      "readOnly": true
    }
  }
}
```

Interpretation:
- JSON Schema constrains percent semantics (`0..100`).
- `map` performs the conversion and range-to-label execution.

## Minimal `map` Terms Likely to Remain

Even with broader JSON Schema usage, these `map` terms are usually still required:
- `map:valueMapping`
- `map:fromWire`
- `map:toWire`
- `map:op`
- `map:value`
- `map:map`
- `map:wire`
- `map:app`
- `map:ranges`

## Final Assessment

JSON Schema is an excellent complementary layer for data shape, allowed value sets, and constraints. It can replace some custom mapping expressions, especially simple coded-state declarations (`oneOf` + `const`) and bound constraints (`minimum`/`maximum`).

However, JSON Schema is not an execution language for directional data transformation. Therefore, for use cases 3 and 4 in TD data mapping, `map` remains necessary as the runtime transformation layer.

Practical design outcome:
- Use JSON Schema first for constraints and declarative value-domain semantics.
- Keep `map` for executable conversion logic and read/write direction.