# LoRaWAN Terms vs. General Data Mapping Terms

This document analyzes the LoRaWAN binding terms (`lorav:*` namespace) against the generalized data mapping operations and conversions defined in `analysis-data-mapping-operations.md` and `analysis-data-mapping-conversion.md`.

## Overview

The LoRaWAN binding uses a rich set of protocol-specific terms to handle payload encoding/decoding. This analysis identifies which LoRaWAN terms can be mapped to (or replaced by) the general terms proposed for core Thing Description, and which LoRaWAN terms are specific to the protocol and lack general equivalents.

---

## Table 1: LoRaWAN Terms with General Equivalents

These LoRaWAN terms express payload transformations that can be generalized and represented using the core data mapping operations and conversions.

| LoRaWAN Term | Purpose | General Equivalent(s) | Notes |
|---|---|---|---|
| `lorav:multiplier` | Scale wire value by constant: `value = raw * multiplier` | `map:op: "mul"` with `map:value` | Direct numeric scaling operation |
| `lorav:divisor` | Scale wire value by division: `value = raw / divisor` | `map:op: "mul"` with inverted value, or future `map:op: "div"` | Can be modeled as multiplication by reciprocal, or as separate divide operation if added to core |
| `lorav:offset` | Add constant after scaling: `value = value + offset` | `map:op: "add"` with `map:value` | Additive operation applied in sequence after multiplication |
| `lorav:enum` | Map raw integers to semantic labels | `map:op: "enum"` with `map:map` array | Exact value mapping from wire integer to application enum symbol |
| `lorav:bitmask` | Extract contiguous bit range from wire value | `map:op: "bitExtract"` with `map:mask` and `map:shift` | Bitmask defines the bits to extract; shift value derived from bit position |
| `lorav:polynomial` | Evaluate polynomial: `c0 + c1*x + c2*x² + …` | Composite `map:op` sequence: `mul`, `add`, `clamp` | Can be decomposed into sequence of numeric operations |
| `lorav:transform` | Ordered post-processing ops: `add` / `div` / `mult` | `map:op` sequence in `fromWire` pipeline | Direct parallel: already an ordered operation list |
| `lorav:compute` | Binary operation combining two values (e.g., `{op: "add", a, b}`) | Composite numeric operation or future `map:op: "compute"` | Combines two input field values; fits composite operation model |
| `lorav:presenceField` + `lorav:presenceBit` | Conditional inclusion of a property when a flag bit is set | Structural conditional: flagged pattern or `map:op: "bitExtract"` + conditional gate | Read/write only when specified bit in presence field is set |
| `lorav:switchField` + `lorav:switchValue` | Discriminator: decode one case selected by field value | Structural conditional: `match`/`case` pattern or enum-based routing | Payload structure varies based on discriminator value |
| `lorav:ref` | Input value a computed property derives from | Reference to another property in pipeline or composite operation | Allows computed fields to reference other decoded values |
| `lorav:guard` | Conditional gate selecting a derived value: `{when, else}` | Structural conditional: `map:op: "guard"` or conditional gate | Choose between alternative values based on a condition |

---

## Table 2: LoRaWAN Terms Without General Equivalents

These LoRaWAN terms are protocol-specific or relate to structural/metadata aspects of LoRaWAN payloads that do not have direct counterparts in the general data mapping model.

| LoRaWAN Term | Purpose | Classification | Rationale |
|---|---|---|---|
| `lorav:payloadLayout` | Declares layout strategy: `fixed` \| `ports` \| `tlv` \| `ctv` | Protocol-specific layout mode | Fundamental to LoRaWAN architecture (fixed byte offset vs. fPort-based vs. tagged payloads) |
| `lorav:byteOffset` | Byte position in a fixed-layout payload | Protocol-specific positional indicator | LoRaWAN `fixed` layout uses explicit byte offsets; not generalized in abstract model |
| `lorav:type` | Wire data type: XSD type alias (e.g., `xsd:short`) or native (e.g., `s16`, `u8`, `f32`) | Metadata: data type specification | Describes how bytes on the wire are interpreted (signed/unsigned, integer/float, width) |
| `lorav:mostSignificantByte` | Endianness flag: `true` = big-endian, `false` = little-endian | Metadata: byte order specification | Essential for multi-byte integer interpretation; implicit in some bindings, explicit in LoRaWAN |
| `lorav:fPort` | LoRaWAN frame port number selecting a fixed layout | Protocol-specific routing key | LoRaWAN application-layer frame port; used to dispatch to different property subsets |
| `lorav:tag` | Tag selecting a value in TLV/CTV payloads, e.g., `[3, 103]` | Protocol-specific tagging key | LoRaWAN tag structure (channel + type for TLV, or custom tag for CTV); binds property to payload location |
| `lorav:length` | Byte length for variable-length fields (`bytes`, `string`, `hex`) | Metadata: field size specification | Specifies fixed buffer length or `-1` for consume-rest semantics |
| `lorav:unit` / `lorav:unece` | Engineering unit or UN/CEFACT code | Metadata: physical unit annotation | Semantic annotation for display/interpretation; not a transformation rule |
| `lorav:slot` | Order of a property within its group (multi-field TLV, flagged group, match case) | Metadata: field ordering | Specifies decode order and composition order within conditionally-included groups |
| `lorav:var` | Discriminator alias, referenced as `$var` when switch field name differs from property name | Protocol-specific aliasing | Allows internal references to discriminator values without exposing property names |
| `lorav:padBefore` | Reserved bytes consumed before this property within its group | Protocol-specific padding | Padding/skip bytes within a conditional group or TLV case (structural alignment) |
| `lorav:devEUI` | 8-byte device identifier (16 hex chars) | Device-level metadata | OTAA identifier; not a payload transformation |
| `lorav:joinEUI` | 8-byte join/app identifier (formerly AppEUI) | Device-level metadata | OTAA identifier; not a payload transformation |
| `lorav:macVersion` | LoRaWAN MAC version (e.g., `1.0.3`, `1.1.0`) | Device-level metadata | Version indicator; not a payload transformation |
| `lorav:endDeviceId` | Human/LNS end-device identifier | Device-level metadata | Display name; not a payload transformation |
| `lorav:brand` | End-device brand/vendor | Device-level metadata | Provenance annotation; not a payload transformation |
| `lorav:model` | End-device model | Device-level metadata | Provenance annotation; not a payload transformation |
| `lorav:hardwareVersion` | Hardware revision | Device-level metadata | Version annotation; not a payload transformation |
| `lorav:softwareVersion` | Firmware/software version | Device-level metadata | Version annotation; not a payload transformation |
| `lorav:region` | Regulatory region/profile (e.g., `EU868`) | Device-level metadata | LoRaWAN region identifier; not a payload transformation |
| `lorav:frequencyPlan` | LNS frequency plan id (e.g., `EU_863_870_TTN`) | Device-level metadata | Network server frequency configuration; not a payload transformation |

---

## Summary

### Generalizable Terms (Table 1)
**Count: 12 terms**

The following LoRaWAN terms directly express value and structural transformations that align with the proposed general data mapping model:
- **Numeric operations:** `lorav:multiplier`, `lorav:divisor`, `lorav:offset`, `lorav:polynomial`
- **Enum mapping:** `lorav:enum`
- **Bitfield operations:** `lorav:bitmask`
- **Composite/pipeline operations:** `lorav:transform`, `lorav:compute`
- **Structural conditionals:** `lorav:presenceField`, `lorav:presenceBit`, `lorav:switchField`, `lorav:switchValue`, `lorav:ref`, `lorav:guard`

These terms can be progressively migrated to (or aligned with) core operations as the general data mapping vocabulary is standardized. Cross-binding reuse can then replace protocol-specific extensions.

### Non-Generalizable Terms (Table 2)
**Count: 21 terms**

These terms serve either:
1. **Protocol-specific positional/routing roles** (`lorav:payloadLayout`, `lorav:byteOffset`, `lorav:fPort`, `lorav:tag`): Fundamental to LoRaWAN's packet structure; remain in binding.
2. **Metadata annotations** (`lorav:type`, `lorav:mostSignificantByte`, `lorav:length`, `lorav:unit`, `lorav:unece`, `lorav:slot`, `lorav:var`, `lorav:padBefore`): Essential for correct interpretation but not transformation logic; may belong in binding or in a shared "wire metadata" model.
3. **Device-level information** (all `lorav:*` Thing-level terms): Onboarding, device identification, and version info; orthogonal to payload transformation.

---

## Recommendations

1. **Prioritize porting Table 1 terms to core operations:** The 12 generalizable terms represent common, cross-protocol patterns. Define them in the core data mapping model to enable binding-agnostic payload handling.

2. **Retain Table 2 terms in binding specifications:** The 21 non-generalizable terms are protocol-specific or metadata-only. Keep them in binding templates (e.g., LoRaWAN binding), not in TD core.

3. **Consider a shared "wire metadata" layer:** Metadata terms like `type`, `endianness`, and `length` recur across bindings (Modbus, BACnet, etc.). A lightweight, reusable wire-metadata model might reduce duplication, though care must be taken to avoid bloating core TD.

4. **Use Table 1 as a migration roadmap:** As each general operation is added to core, audit existing binding implementations (LoRaWAN, BACnet, Modbus, etc.) to map their equivalents, unifying the ecosystem over time.

