# Data Mapping User Story 3 — Basic Mathematical Operations - Summary

- **Who:** Developer of a Consumer, TD Designer
- **What:** Express the need to apply mathematical operations to the data received or to be sent as a protocol message
- **Why:** Guarantee that the data fits to the protocol message while staying easy to understand for the application

- Sentence: **As a** Developer of a Consumer, TD Designer, **I need** to express the need to apply mathematical operations to the data received or to be sent as a protocol message, **so that I can** guarantee that the data fits to the protocol message while staying easy to understand for the application.
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Multiple
  - Implementation Volunteers: ?
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: More use cases covered without protocol-specific vocabularies
- Linked Use Cases or Categories: TBD
- Relevant issues:
  - Extending Data Mapping Examples: https://github.com/w3c/wot-thing-description/issues/2034#issuecomment-4260667948
  - Basic Operations on Data: https://github.com/w3c/wot-thing-description/issues/2169
  - Should it be possible to indicate whether writing a property returns set value?: https://github.com/w3c/wot-thing-description/issues/875
- Existing Solutions:
  - Lorawan Binding: https://github.com/w3c/wot-binding-templates/pull/458 (`lorav:multiplier`)

---

## User Story Summary

**Problem:** A protocol payload contains numeric values in a wire encoding that differs from the application-level representation. Examples include raw byte values representing temperatures in deci-degrees, brightness as a 0–255 byte, or sensor calibration with a scale factor.

**Proposed solution:** A declarative, direction-explicit, ordered operation pipeline attached at form level. Operations are applied strictly in document order. The pipeline runs in `fromWire` direction on read and `toWire` direction on write.

**Core operations:**
- `mul` — multiply by a constant
- `add` — add a constant
- `reciprocal` — replace the current value with a constant divided by the current value
- `round` — round with mode `floor`, `ceil`, `nearest`, or `towardZero`
- `clamp` — enforce min and/or max bounds

**Key design decisions:**
- Direction is explicit per form, not inferred.
- Operation order is normative.
- `NaN` and infinity are invalid unless explicitly allowed.
- Rounding and clamping are separate steps, not implicit in arithmetic.

---

## Standard Term Evaluation

Three existing standards were evaluated to reduce the proprietary `map` surface for user story 3.

### QUDT

**Covers well:**
- Quantity kind semantics (`qudt:hasQuantityKind`)
- Unit semantics (`qudt:hasUnit`); however (`unit`) is a standard TD term and should be used instead
- Unit conversion metadata (`qudt:conversionMultiplier`, `qudt:conversionOffset`)

**Does not cover:**
- TD-specific directional pipeline (`fromWire`, `toWire`)
- Arbitrary protocol encoding tricks that are not genuine unit conversions (e.g. a brightness byte 0–255 mapped to 0–100%)
- Ordered execution steps, rounding, and clamping as operations

**Recommended use:** Use QUDT at property level for quantity/unit annotations when the transform is a genuine unit conversion. QUDT explains *what a value means*; `map` explains *how a TD runtime converts it*.

---

### FnO (Function Ontology)

**Covers well:**
- Abstract function declarations (`fno:Function`, `fno:expects`, `fno:returns`, `fno:Parameter`, `fno:Output`)
- Partial application of constants (`fnoc:PartiallyAppliedFunction`, `fnoc:parameterBinding`)
- Ordered pipeline composition (`fnoc:Composition`, `fnoc:composedOf`)

**Does not cover:**
- A built-in catalog of arithmetic primitives (`mul`, `round`, `clamp`)
- TD form-level attachment (`fromWire`, `toWire`)
- TD-specific write-path inversion policy

**Recommended use:** Use FnO as an optional enrichment layer for describing reusable transformation functions. FnO explains *which function is applied and how it is composed*; `map` remains needed for *where in the TD form that function is invoked*.

---

### JSON Schema

**Covers well:**
- Declarative value constraints (`minimum`, `maximum`, `multipleOf`)

**Does not cover:**
- Executable directional transformations
- Ordered operation pipelines (`mul`, `round`, `clamp`)

**Recommended use:** Use JSON Schema for application-level value constraints (`minimum`, `maximum`, `multipleOf`). It complements `map` but cannot replace it.

---

### Capability Matrix Summary

| Capability | QUDT | FnO | JSON Schema | Keep `map`? |
|---|---|---|---|---|
| Quantity kind and unit semantics | Yes | No | No | No |
| Standard unit conversion (mul/add as unit math) | Yes | Partial | No | Sometimes |
| Reusable function signatures and composition | No | Yes | No | Sometimes |
| Declarative value constraints | No | No | Yes | No |
| Directional pipeline (`fromWire`, `toWire`) | No | No | No | Yes |
| Write-path inversion policy | No | No | No | Yes |

---

## Proprietary Context Definition

The following JSON-LD context defines only the terms required for user story 3 that are not covered by QUDT, FnO, or JSON Schema.

The namespace `https://www.w3.org/wot/data-mapping/v1#` is a placeholder. The prefix `map` is used throughout this document.

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

    "value": {
      "@id": "map:value",
      "@type": "xsd:decimal"
    },

    "mode": {
      "@id": "map:mode",
      "@type": "xsd:string"
    },

    "min": {
      "@id": "map:min",
      "@type": "xsd:decimal"
    },

    "max": {
      "@id": "map:max",
      "@type": "xsd:decimal"
    }
  }
}
```

**Notes:**
- `valueMapping`, `fromWire`, and `toWire` are the core attachment and direction terms. They are always proprietary.
- `op` and its numeric operation identifiers (`mul`, `add`, `reciprocal`, `round`, `clamp`) are proprietary execution step identifiers with no standard equivalent.
- QUDT terms (`qudt:hasQuantityKind`, etc.) and JSON Schema keywords (`minimum`, `maximum`, `multipleOf`) are used directly alongside this context without being redefined here.
- FnO terms (`fno:Function`, `fnoc:PartiallyAppliedFunction`, etc.) may be used as optional enrichment alongside this context for reusable function descriptions.

### Term Reference

#### Pipeline Attachment and Direction

| Term | Description |
|---|---|
| `map:valueMapping` | Container object attached to a TD form that holds the `fromWire` and/or `toWire` pipeline. |
| `map:fromWire` | Ordered list of operation objects executed when reading a value from the protocol (wire → application). Applied on read interactions. |
| `map:toWire` | Ordered list of operation objects executed when writing a value to the protocol (application → wire). Applied on write interactions. If absent for a writable form, a write attempt must fail with `error`. |

#### Operation Selector

| Term | Description |
|---|---|
| `map:proc` | String identifier for the operation to execute in one pipeline step. Required in every operation object. |

Valid `map:proc` values for user story 3:

| Value | Description |
|---|---|
| `mul` | Multiply the current numeric value by `map:value`. |
| `add` | Add `map:value` to the current numeric value. |
| `reciprocal` | Replace the current numeric value with `map:value / currentValue`. The current value must not be zero. |
| `round` | Round the current numeric value according to `map:mode`. |
| `clamp` | Constrain the current numeric value to the range `[map:min, map:max]`. |

#### Numeric Operation Parameters

| Term | Used by | Description |
|---|---|---|
| `map:value` | `mul`, `add`, `reciprocal` | Numeric constant operand. For `mul` this is the factor; for `add` this is the addend; for `reciprocal` this is the numerator. |
| `map:mode` | `round` | Rounding strategy. Valid values: `floor` (round down), `ceil` (round up), `nearest` (round half to even), `towardZero` (truncate). |
| `map:min` | `clamp` | Lower bound. Values below this are set to `map:min`. |
| `map:max` | `clamp` | Upper bound. Values above this are set to `map:max`. |

---

## Examples

All examples include both proprietary `map` terms and available standard terms.

---

### Example 1: Lion EMS Cabinet Temperature Scaling

The Lion Energy EMS Modbus server exposes cabinet temperature at holding register `1237` as a read-only signed 16-bit value in deci-degrees Celsius (`237` means `23.7 C`).

**TD (Lion EMS Modbus server):**

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
  "id": "urn:example:thing:lion-ems-1",
  "title": "LionEnergyEMS",
  "links": [{ "rel": "type", "href": "urn:example:tm:TemperatureSensorModel", "type": "application/td+json" }],
  "properties": {
    "temperature": {
      "type": "number",
      "minimum": -40,
      "maximum": 125,
      "multipleOf": 0.1,
      "readOnly": true,
      "qudt:hasQuantityKind": "quantitykind:Temperature",
      "unit": "unit:DEG_C",
      "forms": [
        {
          "href": "modbus://lion-ems.example.local/holding-register/1237",
          "contentType": "application/octet-stream",
          "op": ["readproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:proc": "mul", "map:value": 0.1 }
            ]
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- QUDT annotates the property-level unit (`unit:DEG_C`) to capture *semantics*.
- `map:valueMapping` with `map:fromWire` captures the *runtime execution* step.
- JSON Schema `minimum`, `maximum`, and `multipleOf` constrain the application-level value.
- No `map:toWire` is needed because the property is read-only.

---

### Example 2: Lion EMS Power Factor Scaling and Clamping

The Lion Energy EMS Modbus server exposes inverter power factor at holding register `1205` as a read-only signed 16-bit value in hundredths. The documented application range `[-1.0, 1.0]` corresponds to raw register values `[-100, 100]`. For example, wire value `95` represents power factor `0.95`, while wire value `-95` represents `-0.95`.

**TD (Lion EMS Modbus server):**

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
  "id": "urn:example:thing:lion-ems-1",
  "title": "LionEnergyEMS",
  "properties": {
    "powerFactor": {
      "title": "Inverter Power Factor",
      "type": "number",
      "minimum": -1,
      "maximum": 1,
      "multipleOf": 0.01,
      "qudt:hasQuantityKind": "quantitykind:DimensionlessRatio",
      "unit": "unit:UNITLESS",
      "forms": [
        {
          "href": "modbus://lion-ems.example.local/holding-register/1205",
          "contentType": "application/octet-stream",
          "op": ["readproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:proc": "mul", "map:value": 0.01 },
              { "map:proc": "clamp", "map:min": -1, "map:max": 1 }
            ]
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- The wire encoding is not a standard unit conversion, so `map` operations are required even though QUDT annotates the dimensionless semantics.
- Register `1205` is read-only in the Lion EMS system data map, so the TD correctly declares only `readproperty` and has no `map:toWire` pipeline.
- The signed register permits both positive and negative values: `95 * 0.01 = 0.95` and `-95 * 0.01 = -0.95`.
- The `0.01` multiplier preserves the documented hundredths precision (`multipleOf: 0.01`), while `map:clamp` enforces the application-level range. Rounding is intentionally omitted because rounding to an integer would incorrectly change `0.95` to `1`.

---

### Example 3: HTTP Light Colorpicker Properties

Philips Hue exposes the current dimming value as `dimming.brightness`, a `0..100` percentage, and the current color temperature as `color_temperature.mirek`, an integer reciprocal-megakelvin value. Modern colorpicker applets usually present color temperature in kelvin because lower and higher values are easier for humans to understand as cooler and warmer light. This example therefore exposes two application-level properties that a colorpicker applet can consume directly: brightness in percent and color temperature in kelvin.

**TD (HTTP endpoints exposing Hue light setting leaves):**

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
  "id": "urn:example:thing:hue-light-1",
  "title": "HueLightColorpicker",
  "properties": {
    "brightness": {
      "title": "Brightness",
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "readOnly": false,
      "writeOnly": false,
      "qudt:hasQuantityKind": "quantitykind:DimensionlessRatio",
      "unit": "unit:PERCENT",
      "forms": [
        {
          "href": "http://hue.example.local/clip/v2/resource/light/01234567-89ab-cdef-0123-456789abcdef/dimming/brightness",
          "contentType": "application/json",
          "op": ["readproperty", "writeproperty"]
        }
      ]
    },
    "colorTemperature": {
      "title": "Color Temperature",
      "type": "integer",
      "minimum": 2000,
      "maximum": 6536,
      "readOnly": false,
      "writeOnly": false,
      "qudt:hasQuantityKind": "quantitykind:ColorTemperature",
      "unit": "unit:K",
      "forms": [
        {
          "href": "http://hue.example.local/clip/v2/resource/light/01234567-89ab-cdef-0123-456789abcdef/color_temperature/mirek",
          "contentType": "application/json",
          "op": ["readproperty", "writeproperty"],
          "map:valueMapping": {
            "map:fromWire": [
              { "map:proc": "clamp", "map:min": 153, "map:max": 500 },
              { "map:proc": "reciprocal", "map:value": 1000000 },
              { "map:proc": "round", "map:mode": "nearest" },
              { "map:proc": "clamp", "map:min": 2000, "map:max": 6536 }
            ],
            "map:toWire": [
              { "map:proc": "clamp", "map:min": 2000, "map:max": 6536 },
              { "map:proc": "reciprocal", "map:value": 1000000 },
              { "map:proc": "round", "map:mode": "nearest" },
              { "map:proc": "clamp", "map:min": 153, "map:max": 500 }
            ]
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- The HTTP endpoints are assumed to expose the individual Hue `LightGet` leaves, so each form receives one numeric value before the `map` pipeline runs.
- The brightness property has no `map:valueMapping` because Hue already exposes `dimming.brightness` in the application's percentage domain. Its `minimum` and `maximum` schema constraints declare the valid range without transforming the value.
- The color-temperature property exposes kelvin to the applet even though the Hue endpoint uses mirek. `map:reciprocal` captures the required transformation in both directions: `kelvin = 1000000 / mirek` on read and `mirek = 1000000 / kelvin` on write.
- The Hue example range `153..500` mirek maps to approximately `6536..2000` K, so the TD presents the application-level range as `2000..6536` K.
- `map:round` and `map:clamp` make the integer write path deterministic and ensure values stay within the Hue light's advertised `mirek_schema` range.

---

## Binding Comparison

This section compares which UC3-relevant `map` terms already have counterparts in other binding context definitions. Only terms needed for user story 3 are shown here.

### LoRaWAN

LoRaWAN defines several binding-specific transformation terms that correspond directly to UC3 numeric operations.

| LoRaWAN Term | Purpose | General `map` Equivalent | Notes |
|---|---|---|---|
| `lorav:multiplier` | Scale wire value by a constant: `value = raw × multiplier` | `map:proc: "mul"` with `map:value` | Direct one-to-one replacement. |
| `lorav:divisor` | Scale wire value by division: `value = raw / divisor` | `map:proc: "mul"` with `map:value = 1/divisor` | Modeled as multiplication by the reciprocal. A dedicated `div` operation could be added later. |
| `lorav:offset` | Add a constant after scaling: `value = scaled + offset` | `map:proc: "add"` with `map:value` | Applied as a sequential step after `mul` in the pipeline. |
| `lorav:polynomial` | Evaluate a polynomial: `c₀ + c₁x + c₂x² + …` | Sequence of `mul` and `add` steps | Decomposed into an explicit ordered pipeline; no dedicated polynomial operation is needed for the moment. |
| `lorav:transform` | Ordered post-processing list of `add`/`div`/`mult` operations | `map:fromWire` pipeline of `map:proc` steps | Already an ordered operation list; structurally identical to the `fromWire`/`toWire` model. |

**Summary:** All five LoRaWAN numeric transformation terms can be represented using the `map:proc` operations `mul`, `add`, and their combinations. Migration replaces the binding-specific terms with the general pipeline without loss of expressiveness.

---

### Modbus

The Modbus binding does not define binding-specific declarative arithmetic transformation terms. Its terms address transport, addressing, request control, and wire representation; value-level transformations are handled externally in application codecs.

| Modbus Term | Purpose | General `map` Equivalent | Notes |
|---|---|---|---|
| *(none in the reviewed Modbus binding)* | — | — | No standard binding term corresponds to `mul`, `add`, `round`, or `clamp`. |

**Summary:** The Modbus binding has no arithmetic transformation terms.
---

### BACnet

The BACnet binding (`bacv:*`) focuses on service selection, BACnet-specific type annotation, and enum/value mapping. It defines no arithmetic transformation terms.

| BACnet Term | Purpose | General `map` Equivalent | Notes |
|---|---|---|---|
| *(none)* | — | — | No `bacv:*` term corresponds to `mul`, `add`, `round`, or `clamp`. |

The binding does define wire type declarations (`bacv:hasDataType` with types such as `bacv:Real`, `bacv:Unsigned`, `bacv:Signed`, `bacv:Double`) that tell the consumer how to interpret the raw BACnet-encoded bytes as a numeric value. These are wire-format metadata — prerequisites for reading a number — not value transformation operations, and they fall outside the `map` pipeline scope.

The enum mapping terms `bacv:hasValueMap`, `bacv:hasMapEntry`, `bacv:hasProtocolVal`, and `bacv:hasLogicalVal` are the BACnet equivalents of the UC4 `map:op: "enum"` pattern and are out of scope for UC3.

**Summary:** BACnet has no existing terms to migrate into UC3. The `map` numeric pipeline needs to be introduced as new form-level annotations alongside the existing `bacv:*` vocabulary. `bacv:hasDataType` provides the wire type context needed before any `map` operation runs but is not itself a UC3 operation.

---

### PROFINET

The PROFINET binding (`profv:*`) focuses on addressing, payload layout, type annotation, structural field extraction, and enum decoding. It defines no arithmetic transformation terms.

| PROFINET Term | Purpose | General `map` Equivalent | Notes |
|---|---|---|---|
| *(none)* | — | — | No `profv:*` term corresponds to `mul`, `add`, `round`, or `clamp`. |

Two PROFINET metadata terms have a bearing on the numeric value interpretation that precedes any UC3 operation:

| PROFINET Term | Purpose | Relation to UC3 | Notes |
|---|---|---|---|
| `profv:mostSignificantByte` | Byte order (`true` = big-endian, `false` = little-endian) | Wire metadata; determines how raw bytes are assembled into a number before `map` runs | Not a transformation operation. |
| `profv:mostSignificantWord` | Word order for multi-byte payloads | Wire metadata; same role as `profv:mostSignificantByte` for 32-bit and wider values | Not a transformation operation. |
| `profv:type` | Declares the wire data type (e.g. `Unsigned16`, `Float32`) | Wire metadata; tells the consumer the numeric type to decode from the payload | Not a transformation operation. |

The structural terms `profv:byteOffset`, `profv:byteLength`, `profv:bitOffset`, `profv:bitlength`, and `profv:payloadMapping` cover UC5 (structural extraction) user stories. The enum terms `profv:enumeratedValue`, `profv:encodedPayload`, and `profv:decodedPayload` cover UC4. Neither group is relevant to UC3.

**Summary:** PROFINET has no existing terms to migrate into UC3. The `map` numeric pipeline needs to be introduced as new form-level annotations. `profv:type`, `profv:mostSignificantByte`, and `profv:mostSignificantWord` collectively define the wire representation of the raw numeric value that the UC3 `map:fromWire` pipeline then transforms.

---

## Role of `map` Terms as Default and Fallback for Binding Implementations

### Two valid homes for the same term

A term with the same semantic meaning can legitimately appear in two places:

1. **In the `map` context and ontology** — as a protocol-independent, core-defined operation with a normative processing model guaranteed by any conformant WoT runtime.
2. **In a binding template definition** — as a protocol-specific term whose interpretation may be tied to the binding's own processing rules, data types, or addressing conventions.

Neither placement is wrong. A binding can define `bacv:scalingFactor` or `lorav:multiplier` with the same arithmetic intent as `map:proc: "mul"` and remain internally consistent. These terms are part of the binding's own vocabulary and their meaning is defined by the binding specification.

### `map` terms as a default and fallback

When a binding-specific term exists, implementations of that binding carry the knowledge of how to process it. However, there are two situations where relying on `map` terms instead is advantageous:

**Implementing an existing binding template.** A developer building a Consumer or Exposer for, say, LoRaWAN or BACnet must implement the full binding vocabulary. If that binding's transformation terms (`lorav:multiplier`, `lorav:offset`, …) are declared as semantically equivalent to the corresponding `map` operations, the implementation can delegate their processing to the core `map` pipeline rather than writing dedicated codec logic for each binding. The binding term becomes an alias, and the `map` implementation in the runtime does the work. This avoids duplicating arithmetic and enum conversion logic across every binding implementation.

**Authoring a new binding template.** When writing a new binding specification, the author can choose to reuse `map` terms directly for any value-level transformation that is not specific to the protocol's wire format. Instead of inventing a new `newbinding:multiplier` term that means the same as `map:proc: "mul"`, the binding can simply reference the `map` operation and note that the standard processing rules apply. The binding remains focused on protocol-specific concerns (addressing, service selection, wire type metadata) while delegating transformation semantics to the core vocabulary.

### Practical implications

- **No code duplication.** A single implementation of the `map` pipeline in a WoT runtime covers the transformation logic for all bindings that use `map` terms, whether natively or as a fallback from a binding-specific alias.
- **Uniform error semantics.** Conformance assertions apply uniformly, regardless of which binding term triggered the operation.
- **Incremental migration path.** Existing binding vocabularies do not need to be revised immediately. A binding specification can document the correspondence between its own terms and `map` equivalents, allowing implementations to treat the binding terms as shorthand for the general pipeline while the ecosystem converges over time.
- **Interoperability across bindings.** A TD that mixes `map` terms with binding-specific terms can be validated and processed by any runtime that implements the core `map` pipeline, even if the runtime does not have full knowledge of every binding vocabulary.
