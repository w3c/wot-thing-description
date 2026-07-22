# Data Mapping Conversion Analysis

This document proposes a solution for challenge 5 (Structured and Simple Data Mismatch: value wrapping, extraction, bitmasking) from `analysis-data-mapping.md`.

The proposal reuses the same design approach as `analysis-data-mapping-operations.md`: a minimal declarative model, explicit read/write direction, deterministic processing order, and strict validation behavior.

## Goal

Define an interoperable and implementation-friendly way to express structural value conversion between application-facing TD DataSchema values and protocol-facing payload structures, without introducing embedded scripting languages.

## Recommendation Summary

1. Standardize challenge 5 as a declarative conversion pipeline, parallel to the operation pipeline used for challenge 3 and challenge 4.
2. Keep direction explicit (`fromWire`, `toWire`) at form level.
3. Support a minimal conversion set first (object path extraction/insertion, array index extraction/insertion, wrapper add/remove, bitfield mapping).
4. Make conversion composition deterministic and normative.
5. Keep challenge 5 composable with challenge 3 and challenge 4 in one processing framework.

## Scope

In scope:
- Extracting nested values from wire payload structures.
- Wrapping application values into required wire payload envelopes.
- Mapping compact wire values (for example bitfields) to structured boolean or enum-like application values.
- Deterministic conversion for read and write paths.

Out of scope:
- Arbitrary code execution.
- Full query languages (for example unrestricted JSONPath engines with non-deterministic features).
- Protocol framing details (addressing, transport headers, timing), which remain in binding templates.

## Candidate Core Conversion Set

The following conversion operators are proposed as a phase 1 core.

Structural extraction and insertion:
- `pick`: select one value from a structured payload by path.
- `place`: place one application value into a structured payload by path.
- `wrap`: wrap a value into a fixed object or array envelope.
- `unwrap`: remove one known envelope layer.

Array and tuple helpers:
- `at`: get array element by index.
- `setAt`: set array element by index.

Bitfield conversion:
- `bitExtract`: map one numeric wire field to a structured object by mask and shift rules.
- `bitCompose`: inverse of `bitExtract`, compose structured flags/fields into one numeric value.

Notes:
- Operators are intentionally simple and deterministic.
- More advanced transforms can be added later only if they keep interoperability.

## Processing Model

Each mapping declares direction explicitly:
- `fromWire`: protocol payload value to application value.
- `toWire`: application value to protocol payload value.

Default order when challenge 5 is combined with challenge 3 and challenge 4:
1. `fromWire`: structural conversion first, then numeric operations, then enum mapping.
2. `toWire`: enum reverse mapping first, then numeric reverse operations, then structural conversion.

This keeps processing predictable and aligns with the operation model already proposed.

## Invertibility and Writability Rules

- A mapping is writable only if `toWire` is defined or derivable without ambiguity.
- Many-to-one structural reductions (for example dropping fields) are read-only unless a canonical reconstruction rule is provided.
- For `bitExtract`/`bitCompose`, overlapping masks are invalid.
- If missing required fields prevent reconstruction, write behavior must be deterministic (`error` by default unless an explicit fallback is defined).

## Validation and Error Semantics

Normative checks should include:
- Path existence behavior must be explicit (`error`, `null`, or `default`).
- `pick` path collisions or ambiguous selectors are invalid.
- `place` must not violate target schema type constraints.
- `at` and `setAt` require valid integer indexes.
- Bitfield masks in one mapping entry must not overlap unless explicitly modeled as shared fields with deterministic precedence.
- Conversion order is normative and deterministic.

## Illustrative Use Case 5 Patterns

### Pattern A: Value Wrapping (simple app value, wrapped wire payload)

Use case:
- Application model: `temperature` as a number.
- Wire payload: `{ "d": { "v": 231 } }`.
- Read path needs extraction, write path needs wrapping.

`fromWire`:
1. `pick` path `d.v` gives `231`.
2. Apply optional challenge 3 transform (for example `mul 0.1`) to get `23.1`.

`toWire`:
1. Apply inverse numeric operation if present.
2. `place` or `wrap` into `d.v`.

### Pattern B: Structured App Value from Compact Wire Bitfield

Use case:
- Wire payload: one byte status field.
- Application model:
  - `alarm` (boolean)
  - `running` (boolean)
  - `mode` (`off|auto|manual`)

`fromWire`:
1. `bitExtract` using declared masks/shifts.
2. Optional challenge 4 enum mapping for `mode` numeric subfield.

`toWire`:
1. Reverse enum mapping for `mode`.
2. `bitCompose` to produce one status byte.

How `map:mask` works in this pattern:
- `map:mask` selects which bits in the wire integer belong to one logical field.
- Extraction follows: `fieldValue = (wireValue AND mask) >> shift`.
- In this example:
  - `alarm`: `mask=1` (`0001`), `shift=0` -> reads bit 0.
  - `running`: `mask=2` (`0010`), `shift=1` -> reads bit 1.
  - `modeCode`: `mask=12` (`1100`), `shift=2` -> reads bits 2 and 3.
- Example with wire value `13` (`1101`):
  - `alarm = (1101 AND 0001) >> 0 = 1`
  - `running = (1101 AND 0010) >> 1 = 0`
  - `modeCode = (1101 AND 1100) >> 2 = 3`
- For `bitCompose`, `map:mask` constrains where each field is written in the output integer; overlapping masks are invalid.

## Example TD Snippets (Provisional)

The snippets are illustrative and reuse the provisional mapping namespace style from `analysis-data-mapping-operations.md`.

### Example 1: Wrapping and Unwrapping

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:wrapped-temp-1",
  "title": "WrappedTemp",
  "properties": {
    "temperature": {
      "type": "number",
      "unit": "degree celsius",
      "forms": [
        {
          "href": "https://api.example.org/dev/7/temp",
          "contentType": "application/json",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:op": "pick", "map:path": "d.v" },
              { "map:op": "mul", "map:value": 0.1 }
            ],
            "map:toWire": [
              { "map:op": "mul", "map:value": 10 },
              { "map:op": "round", "map:mode": "nearest" },
              { "map:op": "place", "map:path": "d.v" }
            ]
          }
        }
      ]
    }
  }
}
```

### Example 2: Bitfield to Structured Object

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://example.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:status-1",
  "title": "StatusThing",
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
          "href": "modbus://example.local/holding-register/30",
          "contentType": "application/octet-stream",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              {
                "map:op": "bitExtract",
                "map:fields": [
                  { "map:name": "alarm", "map:mask": 1, "map:shift": 0, "map:type": "boolean" },
                  { "map:name": "running", "map:mask": 2, "map:shift": 1, "map:type": "boolean" },
                  { "map:name": "modeCode", "map:mask": 12, "map:shift": 2, "map:type": "integer" }
                ]
              },
              {
                "map:op": "enum",
                "map:path": "modeCode",
                "map:map": [
                  { "map:wire": 0, "map:app": "off" },
                  { "map:wire": 1, "map:app": "auto" },
                  { "map:wire": 2, "map:app": "manual" }
                ],
                "map:to": "mode"
              }
            ],
            "map:toWire": [
              {
                "map:op": "enum",
                "map:from": "mode",
                "map:map": [
                  { "map:app": "off", "map:wire": 0 },
                  { "map:app": "auto", "map:wire": 1 },
                  { "map:app": "manual", "map:wire": 2 }
                ],
                "map:to": "modeCode"
              },
              {
                "map:op": "bitCompose",
                "map:fields": [
                  { "map:name": "alarm", "map:mask": 1, "map:shift": 0 },
                  { "map:name": "running", "map:mask": 2, "map:shift": 1 },
                  { "map:name": "modeCode", "map:mask": 12, "map:shift": 2 }
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

## Why This Approach Fits Story 5

- It addresses structured/simple mismatch directly, unlike pure numeric or pure enum transforms.
- It preserves the successful design principles used for challenge 3 and challenge 4.
- It supports common real-world patterns already seen in implementations (payload extraction and bitfield decomposition) while avoiding protocol-specific lock-in.

## Standardization Guidance

1. Keep TD core changes minimal: define extension points and deterministic pipeline semantics.
2. Standardize a small common conversion vocabulary first, then iterate.
3. Align with existing binding vocabulary where possible (for example BACnet and protocol-specific payload terms), but avoid requiring protocol-specific terms for generic conversion logic.
4. Add conformance tests for round-trip behavior, missing path handling, ambiguous mappings, and bitmask overlap rejection.

## Provisional Term Definitions (Draft)

This section drafts concrete phase 1 definitions for the six conversion terms.
The term names are provisional and use the same placeholder namespace style as the rest of this document.

### Common Model Conventions

- `map:fromWire` and `map:toWire` each contain an ordered list of operation objects.
- Each operation object must contain `map:op` with one of the defined term names.
- Operation objects may define `map:onError` with values `error` (default) or `skip`.
- Paths use a deterministic dot notation over JSON object keys and optional array indexes (for example `d.v` or `items[0].value`).

### `pick`

Purpose:
- Extract one value from a structured input at a declared path.

Operation object members:
- Required: `map:op = "pick"`, `map:path` (string).
- Optional: `map:onMissing` with values `error` (default), `null`, `default`.
- Optional: `map:default` used only when `map:onMissing = "default"`.

Behavior:
- Input must be an object or array.
- Evaluate `map:path` against the current input.
- Output is the selected value.

Validation:
- Empty path is invalid.
- Ambiguous selectors are invalid.
- `map:default` without `map:onMissing = "default"` is invalid.

### `place`

Purpose:
- Insert the current value at a declared path in an output structure.

Operation object members:
- Required: `map:op = "place"`, `map:path` (string).
- Optional: `map:createMissing` (boolean, default `true`).
- Optional: `map:targetTemplate` (object or array used as initial container when needed).

Behavior:
- If target container does not exist, create it when `map:createMissing = true`.
- Place current value at `map:path`.
- Output is the resulting structured container.

Validation:
- Path collisions with non-container nodes are invalid.
- `map:createMissing = false` with a missing path target results in error.

### `wrap`

Purpose:
- Wrap the current value into a fixed object or array envelope.

Operation object members:
- Required: `map:op = "wrap"`, `map:template` (object or array containing one placeholder token).
- Optional: `map:placeholder` (string, default `"$value"`).

Behavior:
- Replace the placeholder in `map:template` with the current value.
- Output is the wrapped structure.

Validation:
- Template must contain exactly one placeholder occurrence.
- Placeholder not found or appearing multiple times is invalid.

### `unwrap`

Purpose:
- Remove one known envelope layer and return the contained value.

Operation object members:
- Required: `map:op = "unwrap"`, `map:path` (string) or `map:placeholder` (string pattern).
- Optional: `map:onMissing` with values `error` (default), `null`, `default`.
- Optional: `map:default` used only when `map:onMissing = "default"`.

Behavior:
- Select wrapped value by path or placeholder rule.
- Output is the unwrapped value.

Validation:
- Defining both `map:path` and `map:placeholder` in one operation is invalid.
- Defining neither `map:path` nor `map:placeholder` is invalid.

### `bitExtract`

Purpose:
- Convert one numeric input into a structured object of fields.

Operation object members:
- Required: `map:op = "bitExtract"`, `map:fields` (non-empty array).
- Each field requires: `map:name` (string), `map:mask` (integer), `map:shift` (integer >= 0).
- Optional per field: `map:type` (`boolean`, `integer`), default `integer`.

Behavior:
- For each field, compute `(input & mask) >> shift`.
- If `map:type = "boolean"`, result is `false` for `0`, otherwise `true`.
- Output is an object keyed by `map:name`.

Validation:
- Input must be an integer in supported numeric range.
- Field masks must be non-zero.
- Overlapping masks across fields are invalid unless a future shared-field mode is explicitly defined.

### `bitCompose`

Purpose:
- Convert a structured object of fields into one numeric output.

Operation object members:
- Required: `map:op = "bitCompose"`, `map:fields` (non-empty array).
- Each field requires: `map:name`, `map:mask`, `map:shift`.
- Optional per field: `map:type` (`boolean`, `integer`), default `integer`.

Behavior:
- Start with output `0`.
- For each field value, normalize to integer (boolean `true` as `1`, `false` as `0`).
- Shift left by `map:shift`, apply `map:mask`, and combine with bitwise OR.
- Output is composed integer.

Validation:
- Missing required field value is invalid unless an explicit default policy is defined.
- Value overflow beyond declared mask width is invalid.
- Masks and shifts must be compatible with implementation integer width.

### Minimal Provisional Context Terms

The following term set is the minimum needed to encode the six operations above in TD JSON examples:

- `map:valueMapping`, `map:fromWire`, `map:toWire`
- `map:op`, `map:path`, `map:onMissing`, `map:default`, `map:onError`
- `map:createMissing`, `map:targetTemplate`, `map:template`, `map:placeholder`
- `map:fields`, `map:name`, `map:mask`, `map:shift`, `map:type`

## Conformance Assertions (Draft)

This section defines testable draft assertions for processing order and failure behavior.
The requirement keywords MUST, MUST NOT, SHOULD, and MAY are to be interpreted as in RFC 2119/RFC 8174.

### A. Processing Order Assertions

`DM-CV-ORDER-01` Ordered Pipeline Execution
- A Consumer implementation MUST execute operations in `map:fromWire` and `map:toWire` strictly in document order.
- Reordering, parallel execution with merged side effects, or optimization that changes observable output MUST NOT occur.

`DM-CV-ORDER-02` Deterministic Direction Selection
- For read interactions, a Consumer MUST apply `map:fromWire` when present.
- For write interactions, a Consumer MUST apply `map:toWire` when present.
- If the required direction mapping is absent for the requested interaction, behavior MUST be `error` unless the form is read-only or write-only accordingly.

`DM-CV-ORDER-03` Cross-Challenge Composition Order
- When structural conversion operations (challenge 5) are combined with numeric operations (challenge 3) and enum mapping (challenge 4), implementations MUST apply:
  - Read path: structural conversion -> numeric operations -> enum mapping.
  - Write path: inverse enum mapping -> inverse numeric operations -> structural conversion.
- Implementations MUST NOT use an alternate default ordering.

`DM-CV-ORDER-04` Current-Value Chaining
- The output of each operation MUST become the input of the subsequent operation in the same direction list.
- If an operation yields `null` by policy, the next operation MUST receive `null` as input.

### B. Failure Behavior Assertions

`DM-CV-FAIL-01` Default Failure Policy
- Unless explicitly overridden by operation-level policy, any conversion failure MUST terminate processing with `error`.

`DM-CV-FAIL-02` Path Resolution Failure
- For `pick` and `unwrap`, unresolved paths MUST behave according to `map:onMissing`.
- If `map:onMissing` is not present, the implementation MUST raise `error`.

`DM-CV-FAIL-03` Invalid Operation Configuration
- Invalid operation objects (for example missing required members, mutually exclusive member conflicts, malformed path syntax) MUST be rejected before runtime conversion.
- A TD containing such invalid configuration MUST be treated as non-conformant by validators.

`DM-CV-FAIL-04` Bitfield Validation
- For `bitExtract` and `bitCompose`, zero masks, overlapping masks (without an explicitly standardized shared-field mode), negative shifts, or value overflow beyond mask width MUST raise `error`.

`DM-CV-FAIL-05` Type Preconditions
- Operations with type preconditions MUST validate input type before execution.
- If preconditions are not met, behavior MUST be `error` unless an explicit operation policy defines an alternative.

`DM-CV-FAIL-06` `map:onError = skip`
- If an operation sets `map:onError = "skip"` and the operation fails, the operation result MUST be the unchanged input value, and processing MUST continue with the next operation.
- `skip` MUST NOT be interpreted as producing `null` unless a separate operation policy explicitly states so.

`DM-CV-FAIL-07` Write-Safety for Non-Invertible Mappings
- If `map:toWire` is absent and cannot be derived unambiguously from `map:fromWire`, write attempts MUST fail with `error`.
- Implementations MUST NOT guess reverse mappings.

`DM-CV-FAIL-08` Error Reporting
- Implementations SHOULD expose machine-readable failure details including assertion category, operation index, and failing member name.
- Error messages MAY include protocol-specific context, but MUST preserve the generic failure category for interoperability testing.

### C. Conformance Test Intent (Minimal)

To claim conformance for this draft, an implementation should be verifiable with at least:
- One positive and one negative test for `DM-CV-ORDER-01`.
- One composition-order test for `DM-CV-ORDER-03` proving different order yields different output.
- One unresolved-path test for `DM-CV-FAIL-02` under each `map:onMissing` mode.
- One overlapping-mask rejection test for `DM-CV-FAIL-04`.
- One non-invertible write rejection test for `DM-CV-FAIL-07`.

## Suggested Next Steps

1. Review and refine the provisional term definitions in this document, then align names and constraints with existing WoT vocabulary conventions.
2. Review and refine the draft conformance assertions in this document, then align assertion IDs and error categories with WoT test tooling conventions.
3. Add interoperable test vectors for value wrapping and bitfield conversions.
4. Validate compatibility with existing node-wot data mapping practices and relevant Binding Templates.