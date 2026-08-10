# Data Mapping Use Cases 3, 4, and 5 — Analysis Summary

## Use Case Summaries

### Use Case 3 — Basic Mathematical Operations

**Problem:** A protocol payload contains numeric values in a wire encoding that differs from the application-level representation. Examples include raw byte values representing temperatures in deci-degrees, brightness as a 0–255 byte, or sensor calibration with a scale factor.

**Proposed solution:** A declarative, direction-explicit, ordered operation pipeline attached at form level. Operations are applied strictly in document order. The pipeline runs in `fromWire` direction on read and `toWire` direction on write.

**Core operations (phase 1):**
- `mul` — multiply by a constant
- `add` — add a constant
- `round` — round with mode `floor`, `ceil`, `nearest`, or `towardZero`
- `clamp` — enforce min and/or max bounds
- `affine` (optional shortcut) — equivalent to `mul` then `add`

**Key design decisions:**
- Direction is explicit per form, not inferred.
- Operation order is normative.
- `NaN` and infinity are invalid unless explicitly allowed.
- Rounding and clamping are separate steps, not implicit in arithmetic.

---

### Use Case 4 — Simple Type Conversion (Enum Mapping)

**Problem:** A protocol uses integer or string codes for finite discrete states (e.g. `0|1|2` for `closed|open|jammed`). The application needs semantically meaningful labels or vice versa.

**Proposed solution:** Enum mapping is treated as a composable step in the same pipeline as numeric operations. Two forms are defined:
- `enum` — exact one-to-one value mapping
- `enumRange` — range-to-label mapping (interval to a single enum symbol)

**Key design decisions:**
- Enum mapping is a pipeline step, not a separate mechanism.
- Non-bijective range mappings require explicit write-path policy (canonical representative value or read-only semantics).
- Unknown codes not covered by any mapping entry produce an error by default (`map:onNoMatch`).
- Use case 4 is composable with use case 3 in one pipeline.

---

### Use Case 5 — Structured and Simple Data Mismatch

**Problem:** The wire payload structure does not match the application data schema structure. Examples include nested JSON payloads where the application value must be extracted from a deep path, wire bitfields that need to be decomposed into structured boolean and enum fields, and array indexing.

**Proposed solution:** A complementary conversion pipeline using structural operators. The same direction-explicit ordered model from use cases 3 and 4 is extended with structural conversion operators.

**Core operators (phase 1):**
- `pick` — extract a value at a dot-notation path
- `place` — insert a value at a dot-notation path
- `wrap` — wrap a value into a fixed object/array envelope using a template
- `unwrap` — remove a known envelope layer
- `at` — get an array element by index
- `setAt` — set an array element by index
- `bitExtract` — decompose a numeric wire field into structured boolean/integer fields using mask and shift rules
- `bitCompose` — inverse of `bitExtract`

**Key design decisions:**
- Default cross-challenge composition order: `fromWire` runs structural conversion → numeric ops → enum mapping; `toWire` runs in reverse.
- Overlapping bit masks are invalid.
- Missing path behavior is controlled per operation via `map:onMissing`.
- Write-path is only valid when `toWire` is defined or derivable without ambiguity.

---

## Standard Term Evaluation

Three existing standards were evaluated to reduce the proprietary `map` surface.

### QUDT

**Covers well:**
- Quantity kind semantics (`qudt:hasQuantityKind`)
- Unit semantics (`qudt:hasUnit`)
- Unit conversion metadata (`qudt:conversionMultiplier`, `qudt:conversionOffset`)
- Enumeration structures with stable codes (`qudt:TaggedEnumeration`, `qudt:EnumeratedValue`, `dtype:code`, `dtype:literal`)

**Does not cover:**
- TD-specific directional pipeline (`fromWire`, `toWire`)
- Arbitrary protocol encoding tricks that are not genuine unit conversions
- Ordered execution steps, rounding, clamping as operations
- Range-based enum mapping

**Recommended use:** Use QUDT at property level for quantity/unit annotations and for defining stable coded vocabularies. QUDT explains *what a value means*; `map` explains *how a TD runtime converts it*.

---

### FnO (Function Ontology)

**Covers well:**
- Abstract function declarations (`fno:Function`, `fno:expects`, `fno:returns`, `fno:Parameter`, `fno:Output`)
- Partial application of constants (`fnoc:PartiallyAppliedFunction`, `fnoc:parameterBinding`)
- Ordered pipeline composition (`fnoc:Composition`, `fnoc:composedOf`)

**Does not cover:**
- A built-in catalog of arithmetic primitives (`mul`, `round`, `clamp`)
- A built-in vocabulary for value-table semantics (`wire/app` pairs)
- TD form-level attachment (`fromWire`, `toWire`)
- TD-specific validation and write-path inversion policy

**Recommended use:** Use FnO as an optional enrichment layer for describing reusable transformation functions. FnO explains *which function is applied and how it is composed*; `map` remains needed for *where in the TD form that function is invoked*.

---

### JSON Schema

**Covers well:**
- Declarative value constraints (`minimum`, `maximum`, `multipleOf`)
- Finite coded-state sets in the same domain (`oneOf` + `const` + `title`)
- Enum string sets (`enum`)

**Does not cover:**
- Executable directional transformations
- Ordered operation pipelines
- Cross-domain mappings (e.g. integer wire code to string application label)
- Write-path inversion policy

**Recommended use:** Use JSON Schema first for declarative constraints and value-domain modeling. Replace `map:op: "enum"` with JSON Schema `oneOf`/`const` only when the wire and application value domains are identical (same-domain code labeling). JSON Schema terms are native TD DataSchema keywords and require no additional context prefix.

---

## Capability Matrix Summary

| Capability | QUDT | FnO | JSON Schema | Keep `map`? |
|---|---|---|---|---|
| Quantity kind and unit semantics | Strong | Weak | Weak | Usually no |
| Standard unit conversion (mul/add as unit math) | Strong | Partial | Weak | Sometimes |
| Reusable function signatures and composition | Weak | Strong | Weak | Sometimes |
| Declarative allowed value sets | Partial | Weak | Strong | Sometimes no |
| Coded enum structure (code + label) | Strong | Partial | Partial | Often |
| Range-based label mapping | Weak | Partial | Partial | Yes |
| Directional pipeline (`fromWire`, `toWire`) | Weak | Weak | Weak | Yes |
| Write-path inversion and no-match policy | Weak | Weak | Weak | Yes |
| Bitmap decoding / bit extraction | Weak | Partial | Weak | Yes |
| Structural value wrapping / path extraction | Weak | Partial | Weak | Yes |

---

## Proprietary Context Definition

The following JSON-LD context defines only the terms not covered by QUDT, FnO, or JSON Schema. Standard terms from those vocabularies should be reused directly rather than reinvented here.

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
      "@id": "map:op",
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
    },

    "onNoMatch": {
      "@id": "map:onNoMatch",
      "@type": "xsd:string"
    },

    "onError": {
      "@id": "map:onError",
      "@type": "xsd:string"
    },

    "ranges": {
      "@id": "map:ranges",
      "@container": "@list"
    },

    "mapEntries": {
      "@id": "map:map",
      "@container": "@list"
    },

    "wire": "map:wire",

    "app": "map:app",

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

    "mapFrom": {
      "@id": "map:mapFrom",
      "@type": "xsd:string"
    },

    "mapTo": {
      "@id": "map:mapTo",
      "@type": "xsd:string"
    }
  }
}
```

**Notes:**
- `valueMapping`, `fromWire`, and `toWire` are the core attachment and direction terms. They are always proprietary.
- `op` and its operation identifiers (`mul`, `add`, `round`, `clamp`, `enum`, `enumRange`, `pick`, `place`, `wrap`, `unwrap`, `at`, `setAt`, `bitExtract`, `bitCompose`) are proprietary execution step identifiers with no standard equivalent.
- QUDT terms (`qudt:hasQuantityKind`, `qudt:hasUnit`, `qudt:conversionMultiplier`, etc.) and JSON Schema keywords (`type`, `enum`, `oneOf`, `minimum`, `maximum`) are used directly alongside this context without being redefined here.
- FnO terms (`fno:Function`, `fnoc:PartiallyAppliedFunction`, etc.) may be used as optional enrichment alongside this context for reusable function descriptions.

---

## Examples

All examples include both proprietary `map` terms and available standard terms. Each section covers TM (abstract model, no transport) and TD (deployment instance with forms).

---

### Use Case 3 — Basic Mathematical Operations

#### 3.A — Temperature Sensor (deci-degrees to Celsius, read-only)

**TM (abstract layer):**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/tm/v1.1",
    {
      "qudt": "http://qudt.org/schema/qudt/",
      "unit": "http://qudt.org/vocab/unit/",
      "quantitykind": "http://qudt.org/vocab/quantitykind/"
    }
  ],
  "@type": "tm:ThingModel",
  "title": "TemperatureSensorModel",
  "properties": {
    "temperature": {
      "type": "number",
      "minimum": -40,
      "maximum": 125,
      "multipleOf": 0.1,
      "readOnly": true,
      "qudt:hasQuantityKind": "quantitykind:Temperature",
      "qudt:hasUnit": "unit:DEG_C",
      "description": "Air temperature in degrees Celsius."
    }
  }
}
```

**TD (CoAP binding with deci-degree wire encoding):**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "qudt": "http://qudt.org/schema/qudt/",
      "unit": "http://qudt.org/vocab/unit/",
      "quantitykind": "http://qudt.org/vocab/quantitykind/"
    }
  ],
  "id": "urn:example:thing:temp-sensor-1",
  "title": "TemperatureSensor",
  "links": [{ "rel": "type", "href": "urn:example:tm:TemperatureSensorModel", "type": "application/td+json" }],
  "properties": {
    "temperature": {
      "type": "number",
      "minimum": -40,
      "maximum": 125,
      "multipleOf": 0.1,
      "readOnly": true,
      "qudt:hasQuantityKind": "quantitykind:Temperature",
      "qudt:hasUnit": "unit:DEG_C",
      "forms": [
        {
          "href": "coap://example.local/sensors/temp",
          "contentType": "application/octet-stream",
          "qudt:hasUnit": "unit:DEG_C-DECI",
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

**What the example shows:**
- QUDT annotates the property-level unit (`unit:DEG_C`) and form-level wire unit (`unit:DEG_C-DECI`) to capture *semantics*.
- `map:valueMapping` with `map:fromWire` captures the *runtime execution* step.
- JSON Schema `minimum`, `maximum`, and `multipleOf` constrain the application-level value.

---

#### 3.B — Dimmer (byte 0–255 to percent 0–100, bidirectional)

**TM:**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/tm/v1.1",
    {
      "qudt": "http://qudt.org/schema/qudt/",
      "unit": "http://qudt.org/vocab/unit/",
      "quantitykind": "http://qudt.org/vocab/quantitykind/"
    }
  ],
  "@type": "tm:ThingModel",
  "title": "DimmerModel",
  "properties": {
    "brightness": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "qudt:hasQuantityKind": "quantitykind:DimensionlessRatio",
      "qudt:hasUnit": "unit:PERCENT",
      "description": "Brightness level in percent."
    }
  }
}
```

**TD (Modbus binding with 0–255 wire encoding):**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "qudt": "http://qudt.org/schema/qudt/",
      "unit": "http://qudt.org/vocab/unit/",
      "quantitykind": "http://qudt.org/vocab/quantitykind/"
    }
  ],
  "id": "urn:example:thing:dimmer-1",
  "title": "Dimmer",
  "properties": {
    "brightness": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "qudt:hasQuantityKind": "quantitykind:DimensionlessRatio",
      "qudt:hasUnit": "unit:PERCENT",
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

**What the example shows:**
- The wire encoding is not a standard unit conversion, so `map` operations are required even though QUDT annotates the semantics.
- Rounding and clamping are explicit ordered steps, not implicit in multiplication.
- `map:toWire` makes the write path deterministic; there is no guessing of the inverse.

---

### Use Case 4 — Simple Type Conversion (Enum Mapping)

#### 4.A — Door State Sensor (integer codes to string labels, same-domain case without `map`)

When the application-facing data schema uses integer codes and titles are sufficient for human readability, JSON Schema `oneOf` + `const` replaces a custom `map:op: "enum"`.

**TM:**

```json
{
  "@context": "https://www.w3.org/2022/wot/tm/v1.1",
  "@type": "tm:ThingModel",
  "title": "DoorSensorModel",
  "properties": {
    "doorState": {
      "type": "integer",
      "readOnly": true,
      "oneOf": [
        { "const": 0, "title": "closed" },
        { "const": 1, "title": "open" },
        { "const": 2, "title": "jammed" }
      ],
      "description": "Door state as a coded integer."
    }
  }
}
```

**TD (MQTT binding, wire and app both use integer codes):**

```json
{
  "@context": "https://www.w3.org/2022/wot/td/v1.1",
  "id": "urn:example:thing:door-1a",
  "title": "DoorSensor",
  "properties": {
    "doorState": {
      "type": "integer",
      "readOnly": true,
      "oneOf": [
        { "const": 0, "title": "closed" },
        { "const": 1, "title": "open" },
        { "const": 2, "title": "jammed" }
      ],
      "forms": [
        {
          "href": "mqtt://broker.example.org/doors/1/state",
          "contentType": "application/json",
          "subprotocol": "mqtt"
        }
      ]
    }
  }
}
```

**What the example shows:**
- No `map` context is needed when the wire and application value domains are identical.
- JSON Schema `oneOf` + `const` + `title` provides human-readable labels without a custom conversion step.

---

#### 4.B — Door State Sensor (integer wire codes to string application labels, cross-domain case with `map`)

When the application data schema uses strings and the wire uses integers, a `map` enum step is still needed.

**TM:**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/tm/v1.1",
    {
      "qudt": "http://qudt.org/schema/qudt/",
      "dtype": "http://www.linkedmodel.org/schema/dtype#"
    }
  ],
  "@type": "tm:ThingModel",
  "title": "DoorSensorModel",
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
          { "@id": "urn:example:enum:door-state:closed", "@type": "qudt:EnumeratedValue", "dtype:code": "0", "dtype:literal": "closed" },
          { "@id": "urn:example:enum:door-state:open",   "@type": "qudt:EnumeratedValue", "dtype:code": "1", "dtype:literal": "open" },
          { "@id": "urn:example:enum:door-state:jammed", "@type": "qudt:EnumeratedValue", "dtype:code": "2", "dtype:literal": "jammed" }
        ]
      },
      "description": "Door state as a semantic string."
    }
  }
}
```

**TD (MQTT binding with `map` for runtime conversion):**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "qudt": "http://qudt.org/schema/qudt/",
      "dtype": "http://www.linkedmodel.org/schema/dtype#"
    }
  ],
  "id": "urn:example:thing:door-1b",
  "title": "DoorSensor",
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
          { "@id": "urn:example:enum:door-state:closed", "@type": "qudt:EnumeratedValue", "dtype:code": "0", "dtype:literal": "closed" },
          { "@id": "urn:example:enum:door-state:open",   "@type": "qudt:EnumeratedValue", "dtype:code": "1", "dtype:literal": "open" },
          { "@id": "urn:example:enum:door-state:jammed", "@type": "qudt:EnumeratedValue", "dtype:code": "2", "dtype:literal": "jammed" }
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
            ]
          }
        }
      ]
    }
  }
}
```

**What the example shows:**
- QUDT `TaggedEnumeration` declares the *semantics* of the coded vocabulary.
- `map:op: "enum"` handles the *runtime conversion* from wire integer to application string.
- The two roles are complementary and do not overlap.

---

#### 4.C — Battery State (range-based enum mapping combined with numeric scaling, use cases 3 + 4)

**TM:**

```json
{
  "@context": "https://www.w3.org/2022/wot/tm/v1.1",
  "@type": "tm:ThingModel",
  "title": "BatteryMonitorModel",
  "properties": {
    "batteryState": {
      "type": "string",
      "enum": ["critical", "low", "medium", "high"],
      "readOnly": true,
      "description": "Semantic battery charge band for the application."
    }
  }
}
```

**TD (CoAP binding, raw byte 0–255 on wire):**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
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
                  { "map:min": 0,  "map:max": 10,  "map:app": "critical" },
                  { "map:min": 11, "map:max": 30,  "map:app": "low" },
                  { "map:min": 31, "map:max": 80,  "map:app": "medium" },
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
- Use case 3 (`mul`, `round`) and use case 4 (`enumRange`) compose in one `map:fromWire` pipeline.
- This property is read-only because the range-based classification is many-to-one and no canonical write path is defined.

---

#### 4.D — Writable Battery Target Band (canonical reverse mapping)

**TD (same model, with a defined `toWire` using canonical representatives):**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
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
                  { "map:min": 0,  "map:max": 10,  "map:app": "critical" },
                  { "map:min": 11, "map:max": 30,  "map:app": "low" },
                  { "map:min": 31, "map:max": 80,  "map:app": "medium" },
                  { "map:min": 81, "map:max": 100, "map:app": "high" }
                ]
              }
            ],
            "map:toWire": [
              {
                "map:op": "enum",
                "map:map": [
                  { "map:app": "critical", "map:wire": 5  },
                  { "map:app": "low",      "map:wire": 20 },
                  { "map:app": "medium",   "map:wire": 55 },
                  { "map:app": "high",     "map:wire": 90 }
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

**What the example shows:**
- A writable many-to-one mapping requires an explicit `map:toWire` with canonical representative values.
- `map:toWire` must never be guessed by the runtime.

---

### Use Case 5 — Structured and Simple Data Mismatch

#### 5.A — Nested JSON Payload (value wrapping)

**TM:**

```json
{
  "@context": "https://www.w3.org/2022/wot/tm/v1.1",
  "@type": "tm:ThingModel",
  "title": "TemperatureSensorWrappedModel",
  "properties": {
    "temperature": {
      "type": "number",
      "minimum": -40,
      "maximum": 125,
      "multipleOf": 0.1,
      "description": "Temperature in degrees Celsius extracted from a wrapped payload."
    }
  }
}
```

**TD (HTTP binding where wire payload is `{ "d": { "v": 231 } }` encoding deci-degrees):**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#",
      "qudt": "http://qudt.org/schema/qudt/",
      "unit": "http://qudt.org/vocab/unit/",
      "quantitykind": "http://qudt.org/vocab/quantitykind/"
    }
  ],
  "id": "urn:example:thing:wrapped-temp-1",
  "title": "WrappedTempSensor",
  "properties": {
    "temperature": {
      "type": "number",
      "minimum": -40,
      "maximum": 125,
      "multipleOf": 0.1,
      "qudt:hasQuantityKind": "quantitykind:Temperature",
      "qudt:hasUnit": "unit:DEG_C",
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

**What the example shows:**
- The default composition order puts structural conversion (`pick`/`place`) before numeric operations.
- `map:fromWire` reads: extract from path, then scale.
- `map:toWire` writes: scale, round, then insert at path.

---

#### 5.B — Bitfield Status Register

**TM:**

```json
{
  "@context": "https://www.w3.org/2022/wot/tm/v1.1",
  "@type": "tm:ThingModel",
  "title": "StatusRegisterModel",
  "properties": {
    "status": {
      "type": "object",
      "properties": {
        "alarm":   { "type": "boolean" },
        "running": { "type": "boolean" },
        "mode":    { "type": "string", "enum": ["off", "auto", "manual"] }
      },
      "required": ["alarm", "running", "mode"],
      "description": "Structured device status decomposed from a packed wire byte."
    }
  }
}
```

**TD (Modbus binding where a single holding-register byte encodes all three fields):**

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "map": "https://www.w3.org/wot/data-mapping/v1#"
    }
  ],
  "id": "urn:example:thing:status-1",
  "title": "StatusThing",
  "properties": {
    "status": {
      "type": "object",
      "properties": {
        "alarm":   { "type": "boolean" },
        "running": { "type": "boolean" },
        "mode":    { "type": "string", "enum": ["off", "auto", "manual"] }
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
                  { "map:name": "alarm",    "map:mask": 1,  "map:shift": 0, "map:type": "boolean" },
                  { "map:name": "running",  "map:mask": 2,  "map:shift": 1, "map:type": "boolean" },
                  { "map:name": "modeCode", "map:mask": 12, "map:shift": 2, "map:type": "integer" }
                ]
              },
              {
                "map:op": "enum",
                "map:mapFrom": "modeCode",
                "map:map": [
                  { "map:wire": 0, "map:app": "off" },
                  { "map:wire": 1, "map:app": "auto" },
                  { "map:wire": 2, "map:app": "manual" }
                ],
                "map:mapTo": "mode"
              }
            ],
            "map:toWire": [
              {
                "map:op": "enum",
                "map:mapFrom": "mode",
                "map:map": [
                  { "map:app": "off",    "map:wire": 0 },
                  { "map:app": "auto",   "map:wire": 1 },
                  { "map:app": "manual", "map:wire": 2 }
                ],
                "map:mapTo": "modeCode"
              },
              {
                "map:op": "bitCompose",
                "map:fields": [
                  { "map:name": "alarm",    "map:mask": 1,  "map:shift": 0 },
                  { "map:name": "running",  "map:mask": 2,  "map:shift": 1 },
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

**What the example shows:**
- `bitExtract` decomposes a single integer into named structured fields.
- An `enum` step with `map:mapFrom`/`map:mapTo` targets a named subfield rather than the whole value (use case 5 + 4 composition).
- `bitCompose` is the exact inverse of `bitExtract`.
- Overlapping masks would be invalid; the masks here (`1`, `2`, `12`) are non-overlapping.

**Bit layout reference for this example:**

| Bit(s) | Mask (`binary`) | Field | Type |
|--------|-----------------|-------|------|
| 0 | `0001` = 1 | `alarm` | boolean |
| 1 | `0010` = 2 | `running` | boolean |
| 2–3 | `1100` = 12 | `modeCode` | integer |

---

## Processing Order Reference

When all three use cases are composed in one form, the normative processing order is:

| Direction | Step 1 | Step 2 | Step 3 |
|---|---|---|---|
| `fromWire` | Structural conversion (UC5) | Numeric operations (UC3) | Enum mapping (UC4) |
| `toWire` | Inverse enum mapping (UC4) | Inverse numeric operations (UC3) | Structural conversion (UC5) |

---

## Conformance Assertion Summary

| ID | Rule |
|---|---|
| `DM-OP-ORDER-01` | Operations in `fromWire` and `toWire` MUST execute in document order. |
| `DM-OP-ORDER-02` | Read interactions MUST apply `fromWire`; write interactions MUST apply `toWire`. |
| `DM-CV-ORDER-03` | When UC5, UC3, and UC4 are combined, the composition order above MUST be used. |
| `DM-OP-FAIL-01` | All conversion failures MUST terminate with `error` unless overridden by per-operation policy. |
| `DM-CV-FAIL-04` | Zero masks, overlapping masks, negative shifts, and value overflow MUST raise `error`. |
| `DM-CV-FAIL-07` | Write attempts on non-invertible forms with absent `toWire` MUST fail with `error`. |

---

## Next Steps

1. Finalize term names in the `map` context and align with WoT TD vocabulary conventions.
2. Decide on a stable namespace URI to replace the placeholder `https://www.w3.org/wot/data-mapping/v1#`.
3. Publish the context as a JSON-LD context document at a resolvable URL.
4. Coordinate with Binding Templates to map existing binding-specific terms (e.g. LoRaWAN `lorav:multiplier`, BACnet `bacv:hasValueMap`) onto the core `map` operations.
5. Add interoperable test vectors for all example patterns, including negative cases.
6. Evaluate whether the `map:op` string vocabulary should be defined as a SKOS concept scheme or as plain string identifiers.
