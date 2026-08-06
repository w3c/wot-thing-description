# Protocol Binding and ContentType Binding for TD

This document proposes how a Thing Description runtime can split responsibilities between:
- protocol binding (selected from `href` scheme), and
- contentType binding (selected from `contentType` media type and parameters),

using the same principles already used for protocol dispatch in systems such as node-wot.

It also classifies which Modbus and LoRaWAN terms should be evaluated in which binding layer, and how general cross-protocol terms can be handled.

## Motivation

Current protocol bindings often do two jobs:
1. transport/protocol interaction (connect, request/response, addressing), and
2. payload decoding/encoding details.

A dedicated contentType binding layer can separate these concerns:
- Protocol binding handles wire exchange and protocol semantics.
- ContentType binding handles payload codec and media-type parameters.
- A general mapping layer handles protocol-agnostic value conversion (`fromWire`/`toWire`).

This separation improves reuse and interoperability:
- one contentType binding can be reused by many protocol bindings,
- one mapping pipeline can be reused by all bindings,
- protocol templates stay focused on protocol semantics.

## Proposed 3-Layer Execution Model

### Layer A: Protocol Binding

Selection key:
- `forms[].href` scheme (for example `http`, `coap`, `mqtt`, `modbus+tcp`).

Responsibilities:
- endpoint addressing and routing,
- protocol operation selection,
- connection/session behavior,
- protocol-level timing and retries,
- protocol-level request shaping and response extraction.

Output contract:
- return a raw payload buffer and protocol metadata to the next layer.

### Layer B: ContentType Binding

Selection key:
- `forms[].contentType` media type and parameters.

Responsibilities:
- parse and serialize media format,
- apply media parameters (for example byte order, byte length constraints),
- expose decoded intermediate representation to mapping layer.

Output contract:
- return a typed intermediate value (number/string/object/array/bytes), plus metadata validation results.

### Layer C: General Mapping Layer

Selection key:
- presence of generic mapping terms (for example `map:valueMapping` with `fromWire` and `toWire`).

Responsibilities:
- protocol-agnostic value conversion,
- numeric operations (`mul`, `add`, `round`, `clamp`),
- semantic mapping (`enum`),
- structural conversion (`pick`, `place`, `wrap`, `unwrap`, `bitExtract`, `bitCompose`).

Output contract:
- application-level value consistent with TD DataSchema.

## Binding Dispatch Pattern

Suggested runtime flow:

1. Select protocol binding by `href` scheme.
2. Execute protocol operation and obtain raw payload.
3. Select contentType binding by media type and parameters.
4. Decode payload to intermediate value.
5. Apply general mapping (`fromWire`) to produce application value.
6. For writes, invert order (`toWire` then contentType encode then protocol send).

## Term Allocation Matrix

### Modbus terms

| Term | Evaluate in Protocol Binding | Evaluate in ContentType Binding | Evaluate in General Mapping | Notes |
|---|---|---|---|---|
| `modv:function` | Yes | No | No | Protocol command selector |
| `modv:entity` | Yes | No | No | Protocol resource space selector |
| `modv:unitID` | Yes | No | No | Addressing/routing |
| `modv:address` | Yes | No | No | Register/coil start address |
| `modv:quantity` | Yes | No | No | Logical register/coil span |
| `modv:pollingTime` | Yes | No | No | Observe scheduling |
| `modv:timeout` | Yes | No | No | Transport timeout |
| `contentType` param `byteSeq` | No | Yes | No | Codec byte/word ordering |
| `contentType` param `length` | No | Yes | No (directly) | Payload-size constraint; candidate shared metadata term |

Practical note:
- Modbus often needs scaling/enum/bitfield transformations, but those should be expressed in general mapping terms, not as new Modbus-only transform vocabulary.

### LoRaWAN terms

| Term | Evaluate in Protocol Binding | Evaluate in ContentType Binding | Evaluate in General Mapping | Notes |
|---|---|---|---|---|
| `lorav:payloadLayout` | Mostly Yes | Optional | No | Payload family/routing strategy (`fixed`, `ports`, `tlv`, `ctv`) |
| `lorav:fPort` | Yes | No | No | Port-based routing discriminator |
| `lorav:tag` | Optional | Yes (if treated as payload-format construct) | No | TLV/CTV tag routing |
| `lorav:byteOffset` | No | Yes | No | Binary layout position metadata |
| `lorav:type` | No | Yes | No | Wire primitive type metadata |
| `lorav:mostSignificantByte` | No | Yes | No | Endianness metadata |
| `lorav:length` | No | Yes | No (directly) | Field byte-length metadata |
| `lorav:slot` | No | Yes | No | Layout decode/compose order |
| `lorav:padBefore` | No | Yes | No | Layout padding metadata |
| `lorav:multiplier` | No | No | Yes | `mul` |
| `lorav:divisor` | No | No | Yes | reciprocal `mul` or future `div` |
| `lorav:offset` | No | No | Yes | `add` |
| `lorav:enum` | No | No | Yes | `enum` mapping |
| `lorav:bitmask` | No | No | Yes | `bitExtract`/`bitCompose` |
| `lorav:polynomial` | No | No | Yes | composed numeric ops |
| `lorav:transform` | No | No | Yes | ordered op pipeline |
| `lorav:compute` | No | No | Yes | composed calculation |
| `lorav:presenceField`, `lorav:presenceBit` | No | Optional | Yes | conditional include logic |
| `lorav:switchField`, `lorav:switchValue` | Optional | Optional | Yes | structural conditional/match routing |
| `lorav:ref`, `lorav:guard` | No | No | Yes | derived/computed conditional logic |
| Device metadata terms (`lorav:devEUI`, `lorav:joinEUI`, versions, brand/model, region/plan) | No (runtime decode) | No | No | Thing metadata, not mapping pipeline |

Interpretation guidance:
- Some LoRaWAN terms can be modeled in either protocol or contentType layer depending on implementation boundaries.
- Prefer putting pure binary layout rules in contentType binding and keeping protocol/routing terms in protocol binding.

## Handling General Terms

General terms should be grouped by concern and evaluated in one shared cross-protocol component rather than per-protocol plugins.

### General mapping terms (value conversion)

Evaluate in Layer C (general mapping):
- numeric: `mul`, `add`, `round`, `clamp`,
- semantic: `enum`,
- structural: `pick`, `place`, `wrap`, `unwrap`, `at`, `setAt`, `bitExtract`, `bitCompose`,
- directional orchestration: `fromWire`, `toWire`.

### General wire-metadata terms (new shared profile)

Evaluate in Layer B (contentType binding), not Layer C:
- `wire:byteLength` (candidate normalization target for `contentType` `length=` and `lorav:length` when semantics match),
- `wire:byteOrder` / `wire:wordOrder` (candidate normalization target for `byteSeq`, `lorav:mostSignificantByte`),
- `wire:scalarType` (candidate normalization target for `lorav:type`, protocol-specific primitive type declarations).

This keeps value transformations separate from decoding constraints.

## Suggested TD Modeling Pattern

Per form:
1. protocol selection keys (`href`, protocol vocab),
2. media/codec selection keys (`contentType`, media parameters),
3. optional shared wire metadata block (normalized aliases),
4. general mapping block (`fromWire`, `toWire`).

Example shape (illustrative only):

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "modv": "https://w3c.github.io/wot-binding-templates/bindings/protocols/modbus#",
      "map": "https://example.org/wot/data-mapping/v1#",
      "wire": "https://example.org/wot/wire-metadata/v1#"
    }
  ],
  "id": "urn:example:thing:modbus-temp-1",
  "title": "ModbusTempSensor",
  "properties": {
    "temperature": {
      "type": "number",
      "unit": "degree celsius",
      "forms": [
        {
          "href": "modbus+tcp://192.0.2.10/1/8",
          "contentType": "application/octet-stream;byteSeq=BIG_ENDIAN;length=2",
          "modv:entity": "HoldingRegister",
          "modv:timeout": 1000,
          "wire:byteLength": 2,
          "wire:byteOrder": "big-endian",
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

Why `byteSeq=BIG_ENDIAN` and `wire:byteOrder` both appear:
- The duplication is intentional in this example.
- `byteSeq=BIG_ENDIAN` is the media/binding-specific expression carried in `contentType`.
- `wire:byteOrder="big-endian"` is the proposed normalized cross-protocol expression.

Why this pattern is useful:
- It demonstrates migration from protocol- or codec-specific metadata to shared wire metadata.
- It allows generic tooling to consume one normalized `wire:*` vocabulary across protocols.
- It enables consistency checks: if both are present, they must agree.

Recommended profile choices:
- Transitional profile: keep both and require strict equality.
- Runtime-normalized profile: keep only `contentType` parameter in TD and derive `wire:*` internally.
- Fully normalized profile: keep only shared `wire:*` terms when standardized by profile.

LoRaWAN example (illustrative only):

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "lorav": "https://w3c.github.io/wot-binding-templates/bindings/protocols/lorawan#",
      "map": "https://example.org/wot/data-mapping/v1#",
      "wire": "https://example.org/wot/wire-metadata/v1#"
    }
  ],
  "id": "urn:example:thing:lorawan-temp-1",
  "title": "LoRaTempSensor",
  "properties": {
    "temperature": {
      "type": "number",
      "unit": "degree celsius",
      "readOnly": true,
      "forms": [
        {
          "href": "lorawan://eu1.example.net/devices/70B3D57ED0061234/uplink",
          "contentType": "application/octet-stream;length=2",
          "op": ["readproperty", "observeproperty"],
          "lorav:payloadLayout": "fixed",
          "lorav:fPort": 10,
          "lorav:byteOffset": 0,
          "lorav:type": "s16",
          "lorav:mostSignificantByte": true,
          "wire:byteLength": 2,
          "wire:byteOrder": "big-endian",
          "wire:scalarType": "int16",
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

How this example splits responsibility:
- Protocol binding: `href` (`lorawan://`), `lorav:payloadLayout`, `lorav:fPort`.
- ContentType binding: `contentType`, `length=`, `lorav:type`, `lorav:mostSignificantByte`, `lorav:byteOffset`.
- General mapping: `map:fromWire` with `mul`.

## Conformance and Validation Rules

Recommended checks:
1. Protocol and contentType selection must both resolve to installed handlers.
2. If media parameter and normalized wire metadata are both present, values must be consistent.
3. Layer outputs must type-match layer inputs (protocol bytes -> codec value -> mapping input).
4. Mapping execution order is deterministic and directional (`fromWire` for reads, `toWire` for writes).
5. Ambiguous ownership terms must be assigned by profile conventions (for example LoRaWAN `tag` in protocol vs contentType layer).

## Migration Strategy

1. Keep existing protocol bindings fully functional.
2. Introduce contentType binding as optional plugin layer first.
3. Add normalization aliases from protocol-specific metadata to shared wire terms.
4. Gradually move protocol-agnostic transforms to general mapping terms.
5. Add cross-protocol test vectors (same mapping behavior over Modbus and LoRaWAN examples).

## Answer to the Design Questions

How could contentType binding look like?
- As a dedicated runtime plugin layer keyed by `contentType`, responsible for codec decoding/encoding and media-parameter semantics.

Which Modbus and LoRaWAN terms should be evaluated in which binding?
- Modbus protocol/control/addressing terms in protocol binding; `byteSeq` and `length` in contentType binding; generic transforms in general mapping.
- LoRaWAN routing/protocol terms in protocol binding; binary layout/type/endianness/length terms in contentType binding; arithmetic/enum/bitmask/conditional transforms in general mapping.

How could general terms be handled?
- Use one shared mapping vocabulary for value conversion (Layer C) and one shared wire-metadata vocabulary for codec constraints (Layer B), both reusable across protocol bindings.