# TD Composition and Reuse

> **Status:** Working draft for discussion. This document is a proposal, not a W3C
> specification.
>
> This draft proposes new TD terms for TD-to-TD composition and reuse, based on the
> existing Thing Model concepts. Its term names and processing rules are provisional and
> identify design questions that require Working Group discussion.

## Abstract

This document proposes `td:extends`, `td:subthing`, and `td:ref` to support relationships
between Thing Descriptions (TDs), alongside the existing Thing Model mechanisms.
It defines an initial processing model and examples, and identifies unresolved issues
involving identity, conflicts, forms, security, and dependency handling.

The proposal is limited to TD-to-TD relationships. It does not change existing TM-to-TM
semantics and does not define cross-kind composition.

## 1. Introduction

The Thing Description specification defines `tm:extends`, `tm:submodel`, and `tm:ref` in
the context of Thing Models. Their current targets are Thing Models. This draft proposes
defining corresponding TD-specific terms without changing how TMs use the existing terms.
The current rules are described in the specification's
[Extension and Import](../../index.html#thing-model-extension-import) and
[Composition](../../index.html#thing-model-composition) sections.

This is not a proposal to make TDs templates. TD sources are concrete descriptions and may
contain instance identity, forms, security metadata, and relative URI references. A
processor therefore cannot necessarily copy a TD definition as if it were an abstract TM
definition. The rules must preserve the source's meaning or reject a composition that cannot
be represented safely.

### 1.1 Scope

The following matrix describes the proposed scope:

| Referencing document | Referenced document | Status in this proposal |
| --- | --- | --- |
| TD | TD | Proposed for all three mechanisms |
| TM | TM | Existing behavior; unchanged |
| TD | TM | Out of scope |
| TM | TD | Out of scope |

The referencing document contains the relation or reference. The referenced document is
the target of that relation or reference.

### 1.2 Conformance status

This draft is non-normative. The MUST/SHOULD/MAY language in examples of candidate rules
does not create conformance requirements. A future normative revision must define the exact
processing behavior and conformance classes.

## 2. Terminology

**Referenced TD:** A TD targeted by a `td:extends`, `td:subthing`, or `td:ref` relationship.

**Referencing TD:** A TD that contains a TD-to-TD `td:extends`, `td:subthing`, or `td:ref`
relationship.

**Resolved TD:** A TD processed according to the selected composition relationship and
validated as an ordinary TD.

**Extension:** Whole-description inheritance expressed by a `td:extends` link.

**Child Thing relationship:** Composition expressed by a `td:subthing` link.

**Definition reference:** Reuse of a definition or sub-definition expressed by `td:ref`.

## 3. Design principles

An adopted design should:

1. Keep `td:extends`, `td:subthing`, and `td:ref` semantically distinct.
2. Preserve the current TM-to-TM rules and examples.
3. Preserve source TD meaning, especially identity, form targets, security, context, and
   dependency references.
4. Avoid treating a linked TD as an untyped bag of affordance definitions.
5. Define deterministic conflict and failure behavior; processors must not silently return
   partially composed TDs.
6. State whether a relationship is descriptive or must be resolved before the resulting TD
   is used.

## 4. Vocabulary and target identification

The proposed TD terms use `td:` for `https://www.w3.org/2019/wot/td#`.
`td:extends` and `td:subthing` are proposed link relation identifiers; `td:ref` is a
proposed definition-reference member. They are not aliases for `tm:extends`,
`tm:submodel`, or `tm:ref`. The existing TM terms retain their current definitions.

| Role | Existing TM term | Proposed TD term |
| --- | --- | --- |
| Whole-description inheritance | `tm:extends` | `td:extends` |
| Composition | `tm:submodel` | `td:subthing` |
| Definition reuse | `tm:ref` | `td:ref` |

The corresponding roles do not imply identical processing semantics for models and concrete
Things. In particular, `td:subthing` targets a child Thing's TD, not a child model.

The examples explicitly declare the TD prefix, but that declaration alone does not
standardize the terms. Adoption requires vocabulary definitions, JSON-LD context and
validation updates, and processing rules. In particular, compact spellings in `links[].rel`
require specified relation interpretation; a context prefix alone does not guarantee that
link consumers expand those strings. The final relation syntax remains subject to review.

The examples illustrate proposed syntax, not complete executable TDs. Security and other
required instance metadata must be supplied under the eventual resolution rules.

For the proposed TD-to-TD case, the target document is a TD and the link or retrieval
metadata identifies it as such, for example with `type` set to `application/td+json`.
Processors must validate the retrieved document as a TD; they must not infer its type only
from a file extension.

The TD-to-TD rules apply only when both the composing document and target are TDs. Existing
TM-to-TM rules continue to apply when both documents are TMs. A cross-kind target is not
made valid by this proposal and must be rejected or treated according to existing
specification rules.

The exact behavior when the target media type is absent, incorrect, or unavailable remains
an issue for the normative design.

## 5. `td:extends` between TDs

A TD may declare a `td:extends` link to another TD:

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    { "td": { "@id": "https://www.w3.org/2019/wot/td#", "@prefix": true } }
  ],
  "@type": "Thing",
  "id": "urn:example:lamp:extended",
  "title": "Extended lamp",
  "links": [
    {
      "rel": "td:extends",
      "href": "./base-lamp.td.json",
      "type": "application/td+json"
    }
  ],
  "properties": {
    "brightness": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "forms": [
        {
          "href": "/brightness",
          "op": "readproperty"
        }
      ]
    }
  }
}
```

The intended meaning is that the composing TD reuses the whole source TD as a basis and
adds its own description. The source TD remains unchanged. A future specification must
decide whether resolution produces a new ordinary TD and, if so, which source metadata is
inherited, replaced, or excluded.

The following candidate constraints require review:

- The composing TD's `id` should identify the resulting Thing and should not be replaced
  with the source TD's `id`.
- Duplicate affordance names need a deterministic rule. Options include rejecting
  duplicates, applying a constrained override rule, or requiring explicit renaming.
- Any override rule must preserve the source affordance's behavior and schema constraints
  unless a deliberately broader change is adopted.
- The source's forms and effective security must retain their original ownership and
  meaning; they must not silently acquire the composing TD's base URI or credentials.
- Cyclic extension chains must be detected and reported as errors.

These are candidates, not adopted requirements. In particular, whether extending a TD
means inheritance of affordances, metadata, or both remains open.

## 6. `td:subthing` between TDs

A TD may use `td:subthing` links to identify child Things through their TDs:

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    { "td": { "@id": "https://www.w3.org/2019/wot/td#", "@prefix": true } }
  ],
  "@type": "Thing",
  "id": "urn:example:building:controller",
  "title": "Building controller",
  "links": [
    {
      "rel": "td:subthing",
      "href": "./lighting.td.json",
      "type": "application/td+json",
      "instanceName": "lighting"
    }
  ]
}
```

The initial proposal treats the target as a separately described child Thing associated
with the parent. The child TD remains an independent description with its own identity and
forms. It is not automatically flattened into the parent's affordance maps.

The specification must clarify whether the existing `instanceName` mechanism is sufficient
for TD children, how parent-child identity and navigation are represented, and whether
applications may opt into a flattened view. Any flattening behavior must be distinguished
from the link's basic descriptive relationship.

## 7. `td:ref` between TDs

A TD may use `td:ref` to reuse an affordance definition or sub-definition from another TD:

```json
{
  "@context": [
    "https://www.w3.org/ns/wot-next/td",
    { "td": { "@id": "https://www.w3.org/2019/wot/td#", "@prefix": true } }
  ],
  "@type": "Thing",
  "id": "urn:example:lamp:monitor",
  "title": "Lamp monitor",
  "properties": {
    "powerState": {
      "td:ref": "./lamp.td.json#/properties/powerState",
      "title": "Lamp power state"
    }
  }
}
```

The target follows the existing `tm:ref` URI and JSON Pointer shape. For TD-to-TD use, the
pointer identifies a definition in a target TD. The target definition and its required
dependencies are resolved before the reference is replaced with a usable definition.

The future specification must identify:

- Which target paths are permitted in a TD, including affordance definitions, schemas, and
  reusable definitions.
- Which local members may annotate or override the referenced definition.
- How source contexts and scoped contexts are preserved.
- How nested references and dependency cycles are handled.
- How source-owned forms and security are retained if the referenced definition is an
  executable affordance.
- Whether a referenced definition can be used when its original TD is inaccessible after
  resolution.

Failure to retrieve the target, resolve the pointer, or satisfy a required dependency must
not produce an apparently successful but incomplete affordance.

## 8. Candidate processing model

One candidate model is a composition-aware processor that takes a TD and its referenced TDs
as input and either returns a complete ordinary TD or reports an error. Under this model:

1. The processor validates the composing TD and identifies its TD-to-TD composition
   relations and references.
2. It retrieves and validates the target TDs, checking media types and detecting dependency
   cycles.
3. It resolves each mechanism according to its distinct semantics: whole-description
   inheritance for `td:extends`, child relationship for `td:subthing`, and selected
   definition reuse for `td:ref`.
4. It resolves only specified dependencies and preserves source ownership, contexts, and
   URI meaning.
5. It validates the final TD and returns it atomically, or returns an error without a
   partial result.

This candidate model may not be appropriate for `td:subthing`, which could remain a
descriptive relationship and require no resolution. The specification must decide this per
mechanism rather than impose one processing model on all three.

## 9. Compatibility and relation to existing processing

The version of a target TD in a `td:extends`, `td:subthing`, or `td:ref` relationship is selected according to the [Versioned References between WoT Documents proposal](../td-versioned-references/spec.md). Version selection determines which TD is supplied to the composition operator; it does not change the operator's inheritance, child-relationship, or definition-reference semantics.

TD-to-TD support should be additive. Existing TM-to-TM processing must produce the same
results as before. Processors that do not implement TD-to-TD composition need a defined
way to recognize unsupported use without mistaking it for a valid, fully resolved TD.

The proposal does not change ordinary TD validation for descriptions that do not use the
new TD-to-TD forms. It does not make cross-kind composition valid.

## 10. Security considerations

The composition mechanisms may cause processors to retrieve author-supplied URIs. A
normative design should define or reference safe-fetching constraints, including allowed
schemes and destinations, redirects, response size, retrieval time, and cycle limits.

Composition must not merge retrieval credentials with interaction security. A form copied
from a source TD must not silently inherit credentials from the composing TD or another
source. Resolving references must not weaken a source affordance's effective security.

## 11. Open issues

1. Should a TD containing TD-to-TD composition syntax require composition-aware processing
   before it is considered an ordinary usable TD?
2. For `td:extends`, which root metadata is inherited, and how are duplicate names,
   overrides, and compatibility handled?
3. For `td:subthing`, is the relation only navigable, or is an optional aggregate view
   needed?
4. For `td:ref`, which TD definition paths and dependency classes may be reused?
5. How are source bases, contexts, forms, security definitions, and provenance represented
   after resolution?
6. Which fetch constraints and cycle limits are required?
7. What compatibility signal should processors use for unsupported TD-to-TD targets?
8. What implementation and interoperability evidence is needed before normative adoption?
9. Are the provisional names appropriate, and how should the link relation identifiers
   be serialized and interpreted?
