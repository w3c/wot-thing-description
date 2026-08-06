# Modbus/TCP Terms vs. General Data Mapping Terms

This document analyzes Modbus/TCP binding terms (`modv:*`) as described in `modbus.md` against the generalized data mapping operations and conversions defined in `analysis-data-mapping-operations.md` and `analysis-data-mapping-conversion.md`.

## Overview

Compared to LoRaWAN, the Modbus/TCP binding vocabulary is focused more on transport addressing, request semantics, polling, and binary representation metadata. It contains fewer explicit value-transformation terms.

As a result, most Modbus terms do not map directly to the proposed general operation/conversion pipeline (`mul`, `add`, `enum`, `pick`, `place`, `bitExtract`, etc.).

---

## Table 1: Modbus Terms with General Equivalents

No direct `modv:*` term in `modbus.md` is equivalent to the generalized value-mapping operations or conversion operators from the two analysis documents.

| Modbus Term | Purpose | General Equivalent(s) | Notes |
|---|---|---|---|
| *(none with direct equivalence)* | - | - | Modbus binding terms in `modbus.md` are primarily protocol/control metadata, not declarative value transformation operators |

Potential near-match (not yet standardized in core mapping terms):

| Modbus Term | Purpose | Candidate General Term | Notes |
|---|---|---|---|
| `length` (contentType parameter) | Payload length in bytes (for example register count x bytes per register) | `wire:byteLength` (proposed shared wire-metadata term) | Not a transform operation, but reusable cross-binding wire metadata; could be normalized outside protocol-specific namespaces |

---

## Table 2: Modbus Terms Without General Equivalents

These terms are protocol-specific, transport-level, or wire-format metadata. They do not have direct counterparts in the proposed general data mapping model.

| Modbus Term | Purpose | Classification | Rationale |
|---|---|---|---|
| `modv:function` | Specifies Modbus function to execute (read/write coil/register variants) | Protocol operation selector | Selects protocol command, not a value transformation |
| `modv:entity` | Target Modbus resource kind (`Coil`, `DiscreteInput`, `InputRegister`, `HoldingRegister`) | Protocol resource selector | Selects register/coil space and default function behavior |
| `modv:unitID` | Slave/unit bus address | Protocol addressing | Connection/routing metadata, outside value mapping scope |
| `modv:address` | Start register/coil address | Protocol addressing | Wire location metadata, not conversion logic |
| `modv:quantity` | Number of registers/coils to read or write | Protocol framing/selection | Request span definition, not value conversion |
| `modv:pollingTime` | Polling interval for subscriptions | Protocol timing/control | Scheduling metadata, not payload transformation |
| `modv:timeout` | Request timeout | Protocol timing/control | Transport error/latency control, not payload transformation |
| `byteSeq` (contentType parameter) | Byte and word ordering (`BIG_ENDIAN`, `LITTLE_ENDIAN`, swap variants) | Wire metadata (endianness/word order) | Required for byte interpretation; no direct equivalent in current general operation set |
| `length` (contentType parameter) | Payload length in bytes | Wire metadata (field/payload size) | No direct core equivalent today; strong candidate to generalize as shared `wire:byteLength` metadata |

---

## Summary

### Generalizable Terms (Table 1)
**Count: 0 terms**

Unlike LoRaWAN, `modbus.md` does not define binding-specific declarative arithmetic/enum/structural transformation terms that directly correspond to:
- operation terms from `analysis-data-mapping-operations.md` (`mul`, `add`, `round`, `clamp`, `enum`)
- conversion terms from `analysis-data-mapping-conversion.md` (`pick`, `place`, `wrap`, `unwrap`, `at`, `setAt`, `bitExtract`, `bitCompose`)

In practice, Modbus deployments still need those transformations, but they are typically expressed externally (application logic/codecs), not via dedicated `modv:*` transformation vocabulary in `modbus.md`.

### Non-Generalizable Terms (Table 2)
**Count: 9 terms**

The analyzed Modbus terms serve mainly three roles:
1. **Protocol command and resource selection** (`modv:function`, `modv:entity`)
2. **Addressing and transaction control** (`modv:unitID`, `modv:address`, `modv:quantity`, `modv:pollingTime`, `modv:timeout`)
3. **Wire representation metadata** (`byteSeq`, `length`)

These are essential for Modbus interoperability but are orthogonal to generic value/conversion operations.

---

## Focused Note: `contentType` with `length=`

Yes, `length=` can be mapped to a general term, but not as an operation like `mul` or `enum`.

Recommended interpretation:
- Treat `length=` as **wire metadata constraint** (expected payload size in bytes).
- Normalize it into a cross-binding term such as `wire:byteLength`.

Why this works:
- Same semantic appears in multiple bindings (fixed binary field/payload sizes).
- It supports validation and codec behavior without being protocol-specific.
- It composes cleanly with `fromWire`/`toWire` pipelines: metadata constrains payload size, while operations transform values.

Suggested normalization rule:
- If `contentType` includes `application/octet-stream;length=N`, expose the same value as `wire:byteLength = N` in a shared wire-metadata block.
- If both are present, they must match.

Boundaries:
- Do not replace protocol terms such as `modv:quantity` with `wire:byteLength`; they are related but distinct (`quantity` is logical register/coil count, `byteLength` is encoded payload size).

---

## Recommendations

1. **Keep Modbus control/addressing terms in the binding template:** Terms such as `modv:function`, `modv:unitID`, and `modv:address` are protocol-specific and should remain binding-level.

2. **Add general value/conversion pipelines for Modbus payload semantics:** When Modbus registers need scaling, enum mapping, or bitfield extraction, use the generalized mapping pipeline (`fromWire`/`toWire` with `mul`/`add`/`enum`/`bitExtract`) rather than inventing new Modbus-only terms.

3. **Define a shared wire-metadata layer across bindings:** Metadata recurring across protocols (for example type width, endianness/word order, and byte length) should be standardized in a lightweight reusable model to reduce duplication.

4. **Provide Modbus-focused conformance vectors:** Add examples where one raw register value is transformed via numeric mapping and/or bitfield decomposition to prove interoperability of the general model with Modbus data.

5. **Add a normative mapping for `length=`:** Define a standard rule that maps `contentType` parameter `length` to a shared metadata property (for example `wire:byteLength`) with strict consistency validation.