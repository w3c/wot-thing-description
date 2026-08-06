# Compact Comparison: QUDT vs FnO vs JSON Schema for TD Data Mapping

This document summarizes and compares findings from:
- `analysis-data-mapping-operations-qudt.md`
- `analysis-data-mapping-operations-fnio.md`
- `analysis-data-mapping-operations-jsonschema.md`

Scope:
- Use case 3: Basic mathematical operations
- Use case 4: Simple type conversion / enum mapping

## One-Page Summary

- **QUDT** is best for quantity/unit semantics and standardized conversions.
- **FnO** is best for explicit reusable function signatures and composed transformation pipelines.
- **JSON Schema** is best for declarative value constraints and coded-state modeling (`oneOf`/`const`, `enum`, bounds).
- None of the three fully replaces a TD runtime mapping layer for directional execution; a minimal `map` subset remains necessary in practice.

## Capability Matrix

Legend:
- **Strong**: directly covered and aligned
- **Partial**: possible but incomplete or indirect
- **Weak**: not a good fit

| Capability | QUDT | FnO | JSON Schema | Keep `map`? |
|---|---|---|---|---|
| Quantity kind semantics | Strong (`qudt:hasQuantityKind`) | Weak | Weak | Usually no |
| Unit semantics | Strong (`qudt:hasUnit`) | Weak | Weak | Usually no |
| Standard unit conversion metadata (mul/add as unit math) | Strong (`qudt:conversionMultiplier`, `qudt:conversionOffset`) | Partial (can model function, not unit semantics) | Weak | Sometimes |
| Reusable operation signatures | Weak | Strong (`fno:Function`, `fno:expects`, `fno:returns`) | Weak | Sometimes |
| Partial application of constants | Weak | Strong (`fnoc:PartiallyAppliedFunction`) | Weak | Sometimes |
| Ordered operation composition | Weak | Strong (`fnoc:Composition`) | Weak | Often |
| Declarative allowed value sets | Partial (enumeration structures) | Weak | Strong (`enum`, `oneOf`, `const`) | Sometimes no |
| Coded enum structure (code + label model) | Strong (`dtype:code`, `dtype:literal`) | Partial (function signature only) | Partial (`oneOf`/`const` for same-domain codes) | Often |
| Range-based label mapping (`enumRange`) | Weak | Partial (custom function needed) | Partial (can constrain ranges, not execute conversion) | Yes |
| Directional wire/app split (`fromWire`, `toWire`) | Weak | Weak | Weak | Yes |
| Write-path inversion policy and runtime no-match behavior | Weak | Weak | Weak | Yes |
| Bitmap decoding/bit extraction | Weak | Partial (custom functions) | Weak (constraints only) | Yes |

## Replacement Potential by Pattern

### Pattern A: Genuine unit conversion

Example:
- Wire in kelvin, app in degree Celsius.

Best fit:
- QUDT first.

`map` impact:
- May still need `map` for TD form-level attachment and direction.

### Pattern B: Reusable transformation pipeline

Example:
- scale -> round -> clamp pipeline reused across properties.

Best fit:
- FnO first (function catalog + composition).

`map` impact:
- Keep a thin `map` layer for TD integration (`fromWire` / `toWire`) and runtime policy.

### Pattern C: Finite coded state values

Example:
- `0|1|2` with human-readable labels.

Best fit:
- JSON Schema `oneOf` + `const` (+ `title`) when app and wire domains are identical.

`map` impact:
- Can remove enum mapping tables in same-domain code cases.
- Keep `map` when wire and app domains differ (for example code -> string label conversion).

### Pattern D: True bitmap flags packed into one integer

Best fit:
- None of QUDT/FnO/JSON Schema alone fully solves this in TD form processing.

`map` impact:
- Keep `map` (or equivalent) for bit extraction/composition execution semantics.

## What Each Approach Cannot Replace

### QUDT cannot fully replace
- TD-specific directional pipelines
- arbitrary protocol encoding tricks that are not unit semantics
- ordered execution semantics and runtime policies

### FnO cannot fully replace
- a standardized primitive operation catalog by itself
- compact table semantics for enum/range mapping
- TD form attachment/direction semantics

### JSON Schema cannot fully replace
- executable transformations (`mul`, `add`, `round`, `clamp`)
- directional mapping and inversion semantics
- dynamic decode/encode logic (especially bitmaps)

## Minimal Cross-Cutting `map` Core Still Needed

Across all three analyses, the recurring minimal runtime mapping core is:
- `map:valueMapping`
- `map:fromWire`
- `map:toWire`
- `map:op`

Often still needed depending on scenario:
- `map:value`
- `map:map`
- `map:wire`
- `map:app`
- `map:ranges`

## Practical Architecture Recommendation

1. **Semantics layer**:
- Use QUDT for quantity/unit/scale and coded-enumeration semantics where applicable.

2. **Function layer**:
- Use FnO for reusable operation definitions, signatures, and compositions.

3. **Constraint layer**:
- Use JSON Schema for declarative constraints and coded-state validation (`oneOf`/`const`, `enum`, bounds).

4. **TD execution layer**:
- Keep a minimal `map` runtime vocabulary for form attachment, direction, and policy.

This layered approach minimizes proprietary surface while preserving deterministic TD runtime behavior.

## Decision Heuristic

Use this quick rule set:
- If it is **unit/quantity meaning** -> prefer QUDT.
- If it is **reusable transformation function orchestration** -> prefer FnO.
- If it is **declarative constraints or coded-state validation** -> prefer JSON Schema.
- If it is **read/write direction or runtime conversion execution policy** -> keep `map`.