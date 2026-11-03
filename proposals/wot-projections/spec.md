# WoT Projection Plans

> **Status:** Working draft for discussion. This document is a proposal, not a W3C
> specification.
>
> The experimental vocabulary below is controlled by this proposal repository,
> not assigned by W3C or the OPC Foundation. Normative terms
> (MUST, MUST NOT, SHOULD, and MAY) are used to make the proposed processing contract
> concrete; they do not imply Working Group adoption.

## Abstract

This document proposes a way to describe a projection plan using an ordinary WoT Thing
Description (TD) or Thing Model (TM) envelope. The plan is marked as unresolved, identifies
source TDs or TMs, and selects source affordances using references in the envelope's
affordance maps. A projection-aware processor resolves the plan into an ordinary TD or TM
by combining imported affordances with complete local definitions and permitted annotations.

The proposal does not define a separate document format or media type. It does not define
protocol bindings or materialization into a platform-specific information model.

## 1. Introduction

TDs describe Things and TMs describe reusable models. Applications that need a focused view
across multiple documents otherwise maintain a separate TD or TM whose definitions may drift
from its sources.

A projection plan is a TD or TM envelope marked to indicate that it is not yet an ordinary,
usable TD or TM. It describes selections by reference, optionally contributes annotations or
local affordance definitions, and can be resolved by a projection-aware
processor. Its source manifest can constrain revisions by the source's declared
profile: SemVer TM floors are uncapped, SemVer TD floors select within a major,
and incremental sources require an explicit compatibility line. Resolution
produces a complete TD or TM that existing WoT implementations can process.

A projection plan is distinct from TM inheritance and reuse mechanisms such as `tm:extends`,
`tm:submodel`, and ordinary `tm:ref`. It selects definitions across source documents to
create a task-specific resolved envelope; it does not change the meaning of those existing
mechanisms.

The separate [TD Composition and Reuse proposal](../td-composition/README.md) introduces
provisional `td:extends`, `td:subthing`, and `td:ref` terms for ordinary TD-to-TD use.
Projection remains distinct from those proposed operators as well.

### 1.1 Conformance

This proposal describes requirements for projection-plan authors, ordinary TD/TM admission
processors, and projection-aware processors. An ordinary TD/TM processor MUST reject an
unresolved projection marker unless it invokes projection-aware processing.

A projection-aware processor MUST either return a fully resolved and validated TD or TM or
report a resolution error. It MUST NOT expose an unresolved plan as an ordinary TD or TM,
and MUST NOT return a success-shaped partial result.

### 1.2 Experimental vocabulary

This proposal defines an experimental version 1 vocabulary for implementation
trials. Its namespace IRI is:

`https://raw.githubusercontent.com/marcschier/wot-thing-description/main/proposals/wot-projections/context.experimental-v1.jsonld#`

The [experimental JSON-LD context](context.experimental-v1.jsonld) binds
`wotproj:` to this namespace. The namespace and context are controlled by this
repository; neither is a W3C or OPC Foundation vocabulary assignment. A later
standard vocabulary is a separate version, not an implicit alias. An incompatible
change to this experiment MUST use a different namespace.

The namespace IRI identifies terms; it does not require network retrieval.
Before this proposal is merged, processors use the context artifact from their
explicitly selected source revision rather than expecting the `main` URL to
serve an unmerged context.

The terms are `projection`, `scenario`, `projects`, `sourceName`, `routing`,
`sourceDigest`, `namePrefix`, `selectAll`, `select`, `affordanceKind` and
`resolvedFrom`, with the meanings defined below. The context represents
`projects` as an ordered list and `scenario` and `resolvedFrom` as IRI-valued
members. Consumers MUST identify terms by their expanded IRIs, not the literal
`wotproj` prefix. The earlier `https://example.org/wot/projection#` placeholders
MUST NOT be treated as aliases for this vocabulary.

Other `https://example.org/` IRIs in the examples remain illustrative scenario
and domain identifiers. This experiment does not assign the other proposals'
provisional `td:` terms or version-profile vocabulary.

Explicit projection selectors use the existing `tm:ref` in both TD and TM envelopes. The
projection-plan format reuses this Thing Model term as its selector; its use in a TD envelope
does not waive the TD forms requirement, which resolution satisfies from the source or the
projection host. The proposed `td:ref` is not a projection selector.
`td:` denotes `https://www.w3.org/2019/wot/td#`. Source floors use `tm:minVersion` for TM sources and `td:minVersion` for TD sources,
under the SemVer profile, independently of the selector term. Incremental source
requirements follow the separate contract and informative deployment mapping in
the [versioned-reference proposal][Versioned-reference proposal]; core WoT names
remain open. Cross-kind selections remain specific to marked
projection plans; they do not extend ordinary TD-to-TD or TM-to-TM composition to
cross-kind targets.

## 2. Terminology

**Projection plan:** A TD or TM envelope whose root type includes the projection marker.

**Source:** A TD, TM, or projection plan listed in a projection plan's source manifest.

**Selection:** An affordance reference or bulk rule that identifies affordances to include in
the resolved view.

**Imported affordance:** A selected source affordance included in the result.

**Local affordance:** A complete affordance definition authored directly in the projection
plan rather than selected from a source.

**Resolved view:** The ordinary TD or TM produced by resolving a projection plan.

**Routing:** The choice of whether an imported affordance's forms address its source endpoint
or the projection endpoint.

## 3. Projection envelope

A projection plan MUST use an ordinary TD or TM envelope and MUST include
`wotproj:projection` in the root `@type`. It MUST also include exactly one ordinary root kind:
`Thing` or `tm:ThingModel`. That ordinary root kind determines the result kind. A separate
`wotproj:projectionKind` member MUST NOT be present.

The envelope MUST include:

- an absolute `id`;
- an absolute `wotproj:scenario` IRI identifying the purpose of the view;
- a non-empty ordered `wotproj:projects` source manifest; and
- at least one imported selection or local affordance.

The plan uses the ordinary media type for its envelope kind: `application/td+json` for a TD
or `application/tm+json` for a TM. There is no projection-specific media type or stored
document kind. The projection marker distinguishes an unresolved plan from an ordinary TD
or TM after retrieval.

`wotproj:scenario` is the machine-readable purpose for which the view is intended. Resolution
MUST copy the exact IRI to the resolved TD or TM root. The organization or specification that
establishes a scenario defines its IRI; this proposal defines no scenario identifiers.
Consumers compare the IRI to identify a view intended for a known purpose. A title, an
arbitrary `@type`, or a vendor convention does not substitute for it. The scenario is not an
RDF class: ordinary `@type` assertions on the plan or its selections retain their RDF
class-membership meaning and do not identify the view's purpose.

`wotproj:projects` is declared as an ordered list (`@container: @list`) in the JSON-LD
context rather than as a set, because Section 6 ranks selections by source position.

A plan MAY select from a TD, a TM, or another projection plan. Its own root kind governs
admission of the result. An incomplete TM can remain a TM, but MUST NOT be served as an
executable TD without completion and full TD validation.

The example below uses the experimental vocabulary:

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "td": {
        "@id": "https://www.w3.org/2019/wot/td#",
        "@prefix": true
      },
      "tm": {
        "@id": "https://www.w3.org/2019/wot/tm#",
        "@prefix": true
      },
      "tm:minVersion": {
        "@id": "https://www.w3.org/2019/wot/tm#minVersion",
        "@type": "http://www.w3.org/2001/XMLSchema#string"
      },
      "td:minVersion": {
        "@id": "https://www.w3.org/2019/wot/td#minVersion",
        "@type": "http://www.w3.org/2001/XMLSchema#string"
      },
      "wotproj": "https://raw.githubusercontent.com/marcschier/wot-thing-description/main/proposals/wot-projections/context.experimental-v1.jsonld#",
      "wotproj:projects": {
        "@id": "https://raw.githubusercontent.com/marcschier/wot-thing-description/main/proposals/wot-projections/context.experimental-v1.jsonld#projects",
        "@container": "@list"
      },
      "wotproj:scenario": {
        "@id": "https://raw.githubusercontent.com/marcschier/wot-thing-description/main/proposals/wot-projections/context.experimental-v1.jsonld#scenario",
        "@type": "@id"
      },
      "wotproj:resolvedFrom": {
        "@id": "https://raw.githubusercontent.com/marcschier/wot-thing-description/main/proposals/wot-projections/context.experimental-v1.jsonld#resolvedFrom",
        "@type": "@id"
      }
    }
  ],
  "@type": ["Thing", "wotproj:projection"],
  "id": "urn:example:building:maintenance-view",
  "title": "Pump condition view",
  "wotproj:scenario": "https://example.org/scenarios/predictive-maintenance",
  "wotproj:projects": [
    {
      "wotproj:sourceName": "pump",
      "href": "./pump.td.json",
      "type": "application/td+json",
      "td:minVersion": "1.2.0",
      "wotproj:routing": "source",
      "wotproj:select": [
        { "wotproj:affordanceKind": "property" }
      ]
    }
  ],
  "properties": {
    "pumpSpeed": {
      "tm:ref": "./pump.td.json#/properties/pumpSpeed",
      "title": "Pump speed for condition monitoring",
      "@type": "https://example.org/ontology/ConditionSignal"
    },
    "viewStatus": {
      "type": "string",
      "readOnly": true,
      "forms": [
        {
          "href": "/status",
          "op": "readproperty",
          "contentType": "application/json"
        }
      ]
    }
  }
}
```

`pumpSpeed` is an imported selection because its `tm:ref` identifies a declared source and
points to an affordance in the matching map. Its `@type` annotation adds ordinary RDF class
membership for the maintenance model; it does not identify the view's purpose. `viewStatus`
is a local definition because it does not use a projection-selection reference; it must
satisfy ordinary TD requirements.

An unresolved plan is not yet an executable TD/TM. Projection-aware admission MUST validate
the envelope and projection grammar. Local affordances MUST satisfy the ordinary definition
requirements for the envelope kind. Imported selectors are validated as references and
annotations and are completed during resolution. The processor removes the projection marker,
source manifest, and unresolved selectors, retains the plan's identifier and scenario, and
validates the resulting ordinary TD or TM before returning it.

## 4. Source manifest

`wotproj:projects` is a non-empty ordered array. Every source entry MUST contain:

- `wotproj:sourceName`: a non-empty alias unique in the manifest;
- `href`: a URI reference to the source document; and
- `type`: the expected TD/TM media type, such as `application/td+json` or
  `application/tm+json`.

The order of entries is significant and MUST be preserved by a processor. The source `href`
is resolved against the plan's effective base URI. A processor MUST verify the retrieved
document's actual kind and MUST NOT infer its kind only from a URI suffix.

A source `href` MUST NOT contain a fragment, and no two manifest entries may resolve to the
same absolute URI. To identify the source of a `tm:ref` selector, a processor
resolves the reference against the plan's effective base URI, separates its fragment, and
matches the remaining absolute URI to exactly one resolved source `href`. The fragment is a
URI-encoded RFC 6901 JSON Pointer. This matching rule makes the source manifest authoritative
and prevents an undeclared document from being used as a projection source.

A source entry MAY also contain:

- `wotproj:routing`: `source` or `projection`; `source` is the default;
- `tm:minVersion` or `td:minVersion`: an optional floor for a TM or TD source,
  respectively, under the SemVer profile;
- an incremental compatibility-line selector and optional numeric floor under
  the versioned-reference proposal's supported deployment mapping;
- `wotproj:sourceDigest`: an optional digest pin in the form
  `sha-256:<64 lowercase hexadecimal digits>`;
- `wotproj:namePrefix`: an optional prefix applied to affordance names selected in bulk;
- `wotproj:selectAll`: a boolean indicating selection of every affordance in the source; and
- `wotproj:select`: an array of bounded selection predicates.

A source entry's `type` determines its target kind, not its version profile.
The provider contract MUST establish that profile before constrained source
selection; a processor MUST NOT infer it from the document's version string.
For SemVer sources using the provisional core terms, a TM source MAY carry only
`tm:minVersion`; a TD source MAY carry only `td:minVersion`. The informative
deployment mapping also permits one `uav:minVersion` for either target kind.
A source entry with both core floor terms, or with a core floor for the other target kind, MUST fail as
`invalid-floor`. The floor MUST use the syntax in the [versioned-reference
proposal][Versioned-reference proposal] and MUST NOT use a generated
`0.0.0-N` id. A TM floor has no upper bound. A TD floor is a caret bound:
`X.Y.Z` selects versions from `X.Y.Z` up to but not including `(X+1).0.0`,
including when X is zero. Without a sticky default, an unfloored SemVer source
selects the highest eligible version for its kind, and an unfloored TD source
can cross major versions. Prerelease and sticky-default behavior follow
[versioned-reference selection](../td-versioned-references/spec.md#61-selection).
For authored SemVer versions, the processor MUST use
`version.model` for a TM source and `version.instance` for a TD
source. The projection envelope's own `version.model` or `version.instance`
MUST NOT supply a source floor.

An incremental source MUST have its own explicit compatibility-line selector
and MAY have a numeric floor. The plan's root line and version members MUST NOT
be inherited by sources. Requirements belong on the source entry, never on an
explicit affordance selector. The informative mapping uses
`uav:compatibilityLine` and `uav:minVersion`; it does not replace `td:ref`,
`tm:ref` or other composition operators. Duplicate legacy/new floor spellings
MUST fail as `invalid-floor`.

A source MAY itself be a projection plan. It is resolved before its affordances are selected.
The graph of projection plans MUST be acyclic.

When `wotproj:sourceDigest` is present, the processor MUST compute SHA-256 over the exact
source bytes as retrieved and compare it to the declared value. The hexadecimal digest MUST
be lowercase. The processor MUST NOT canonicalize or otherwise transform the bytes before
hashing. A mismatch MUST fail resolution and identify the source. If the source is provided
only as an already-parsed object and its original bytes are unavailable, the processor MUST
report the pin as unverified and MUST NOT treat it as satisfied. When a source digest and
version requirement are both present, the exact pinned source MUST also satisfy
that requirement: SemVer floor/cap/prerelease rules or the incremental line and
numeric floor. A mismatch MUST fail without fallback. A digest alone does not
establish incremental line membership when identical bytes occur in several
revisions; the processor still needs trusted revision metadata.

For snapshot-bound processing, the exact source occurrence binding selects the
revision. The processor MUST validate its requirement and any source digest
against that bound revision; it MUST NOT substitute live highest-version
selection. A nested plan's digest pins its unresolved bytes, not its resolved
view or transitive sources. WoT-complete publication follows the
[publication model and acceptance contract](../td-versioned-references/spec.md#2-publication-model).

## 5. Selection

An affordance-map member in `properties`, `actions`, or `events` is a projection selection
when its `tm:ref` fragment is a JSON Pointer to a member of a source affordance
map. The target map MUST match the plan member's category, and the target affordance MUST exist.
The source MUST be declared in `wotproj:projects` and MUST match exactly one source as
specified in Section 4; an undeclared source, wrong-category target, or missing target is
an error. The member key in the plan is the selected affordance's name in the resolved view
and need not match the source name.

A `tm:ref` whose fragment does not point into a source affordance map is not a
projection selector. If it is otherwise valid, it retains its ordinary TD/TM reference
semantics. A member without a projection-selection reference is a local affordance definition.
Only `tm:ref` forms a projection selection. A processor MUST NOT treat `td:ref` or any other
reference member as a projection selector; such a member retains the semantics of its own
vocabulary.

### 5.1 Explicit selection and annotations

An explicit selection names one affordance and is the only form that can annotate it. Its
member key names the affordance in the resolved view; its `tm:ref` identifies the source
definition. Alongside `tm:ref`, it MAY carry only the following standard annotation members:

- `title` and `titles`;
- `description` and `descriptions`;
- additional `@type` values; and
- `forms` and `security` under the routing rules of Section 8.

An explicit selection MAY also carry a vendor-defined annotation whose key is a compact IRI
with a prefix bound in the plan's effective context. The expanded IRI MUST NOT be in a WoT
TD, WoT TM, or `wotproj` namespace. The plan's root MAY carry such annotations as well: a
root annotation applies to the resolved Thing or Thing Model, while a selection annotation is
merged into the selected affordance. These annotations remain ordinary WoT extension members.
This proposal defines neither their meaning nor how a consumer uses them, and a processor
MUST preserve them through resolution.

Annotations MUST NOT restate a source affordance's data schema or override a standardized
TD, TM, or projection member. A view that appeared to change a source's type, unit, or range
would describe something the source does not offer. Additional `@type` values MUST NOT remove
source types or change the affordance's ordinary WoT kind. These limits do not apply to local
affordances, which are complete definitions.

Annotation IRIs are interpreted in the plan's effective context, not in the source's
context. Source-owned definition members retain their source's context. A vendor-defined
annotation is copied with its JSON value. Its prefix binding is retained on the resolved
affordance when the source's effective context does not bind that prefix. If the source binds
the same prefix to a different namespace, resolution MUST fail rather than change the meaning
of either document.

The selector's `tm:ref` is consumed during resolution; it is the only member discarded. Any
`tm:ref`, `td:ref`, or other defined reference already present in the source affordance is
not another selector. It is retained and relocated by source identity and original reference
origin according to Section 7.

### 5.2 Whole-source selection

`wotproj:selectAll: true` selects every affordance in every category from that source.
Selecting a source with no affordances in a category contributes none from that category.
A source MAY provide `wotproj:namePrefix` to distinguish its bulk-selected names. The
resolved name is the prefix followed by the source name with its first Unicode code point
upper-cased. For example, source name `serialNumber` with prefix `device` becomes
`deviceSerialNumber`.

### 5.3 Predicate selection

`wotproj:select` is an array of filter objects. A filter object MAY constrain only:

- `wotproj:affordanceKind`: `property`, `action`, or `event`; and
- `@type`: one type IRI or an array of type IRIs.

A filter object MUST NOT carry any other member. The constraints in one filter object are
conjunctive. Multiple filter objects are disjunctive. When `@type` is an array, an affordance
matches only if it has every listed type. A predicate selects all matching affordances in the
source.

The predicate set is closed. It admits no pattern language, expression language, wildcard
syntax, or implementation-defined operator, so two implementations cannot disagree about what
a filter selects.

A `@type` filter MUST compare types by exact expanded-IRI membership, not by compact
spelling. A processor MUST NOT infer subclass relationships. A type filter compares ordinary
JSON-LD class IRIs; the shared definition of a class, not the presence of the tag alone,
gives it interoperable meaning.

### 5.4 Local affordances

A member of an affordance map without a projection-selection reference is a local affordance.
It is a complete definition validated under ordinary TD/TM rules, not an annotation. Its
schema, forms, security, context, and extension terms are owned by the plan.

If a local affordance and one or more imported selections have the same name in the same
category, the local definition replaces the imported selection in the resolved view.
Processors SHOULD report imported selections displaced by local definitions. Local
precedence is independent of manifest order.

## 6. Deterministic conflict resolution

The source manifest order is the first selection-order key. Within a source, explicit
selections precede bulk selections (whole-source and predicate selections). Within each
group, categories are ordered `properties`, `actions`, `events`. Within a category,
selections are ordered by Unicode code point using the name they will have in the resolved
view; ties are ordered by the source affordance name.

The first imported selection of a given view name and category is retained. Later imported
selections of that same name and category are dropped; processors SHOULD report the
displacement. After imported selections are resolved, local affordances with colliding names
replace the imported selection. A local definition never replaces another local definition:
duplicate local names are invalid under ordinary TD/TM rules.

These ordering rules MUST NOT depend on JSON object member order, retrieval completion order,
or processor scheduling. A conforming processor MUST produce equivalent affordance
membership for equivalent plans and source representations.

## 7. Resolution and dependency closure

Resolution produces an ordinary TD or TM whose kind is determined solely by the projection
envelope's ordinary root kind. A source may be a TD, TM, or another projection plan; each
copied affordance and dependency MUST be representable in the resolved envelope, or
resolution fails during final validation.

Resolution MUST:

1. Validate the marked envelope and projection grammar.
2. Resolve and validate every source, apply its profile-specific requirement, and verify
   any declared source digest.
3. Recursively resolve source projection plans depth-first while detecting cycles.
4. Identify explicit, bulk, and predicate selections.
5. Apply deterministic imported-selection precedence and local-definition precedence.
6. Copy each selected definition with permitted annotations.
7. Close known local dependencies of selected definitions.
8. Relocate defined references, preserve contexts and security, and record provenance.
9. Remove projection-only members and the projection marker.
10. Validate the completed ordinary TD or TM.

Resolution is atomic. Failure at any step MUST produce an error and no partial resolved
document. A source-routed executable TD affordance MUST have non-empty source forms, and a
projection-routed affordance MUST receive actual host forms.

### 7.1 Dependencies and references

A processor MUST carry the known document-local dependencies required to interpret selected
affordances. These include referenced reusable schemas or data type definitions, required
URI-variable declarations, security definitions, and other TD/TM-defined dependencies.
Carried support definitions MUST NOT replace selected or owner definitions. A dependency
reference MUST target the definition copied for its source, never a same-named definition
owned by another source.

Supporting definitions MUST be carried without schema overrides. Each merged subtree retains
its owner and original location. A projection-owned form's URI variables, response schemas,
and semantic context belong to the projection owner, even when a source declares the same
names. Source-owned data and security definitions retain source ownership.

The processor MUST maintain a mapping from source-document identity and canonical JSON
Pointer to output pointer. An already selected identical dependency is reused under its
selected output name. Otherwise, the processor allocates a support name deterministically
without replacing an existing selection or owner definition. A support name can retain a
free source name. On collision, the processor uses
`q:d:<B64u(sourceName)>:<B64u(sourcePointer)>`, adding the first unused positive numeric
suffix where an authored name already occupies that spelling. B64u is unpadded base64url of
the exact UTF-8 bytes. Closure traversal MUST use code-point order for object members and
preserve the order of source arrays. Required source URI variables can be carried at the
affordance scope, where same-named variables from different sources remain distinct.

The processor MUST distinguish definitions by expanded identity and context-resolved facts,
not by lexical prefixes alone. A data type definition is reused only when its expanded
identifier and context-resolved facts agree. It MUST preserve literal values and opaque
metadata; dependency
discovery and reference relocation MUST NOT search or rewrite values such as `const`,
`default`, `enum`, or `examples`, or opaque extension payloads.

The exact closure of WoT-defined dependencies and handling of extension-defined references
requires further specification. An implementation MUST NOT rewrite unknown extension values
as though they were URI references.

### 7.2 Provenance

Every imported affordance in the resolved view MUST retain provenance identifying its source
document and original affordance definition pointer. The proposed member
`wotproj:resolvedFrom` carries a URI reference to that original definition. A relative
provenance reference MUST be resolved against the original source document URI before the
definition is moved.

An affordance already carrying provenance retains that original provenance through
subsequent projection resolution. An intermediate bulk plan is not substituted for an
original definition that is absent from that plan's stored body. Local affordances MUST NOT
receive synthetic provenance.

### 7.3 URI references and forms

References whose meaning depends on a containing document's location MUST be resolved
against their original owner and location before the referenced content is moved. References
to definitions copied into the resolved document MUST target the mapped output location.
Only defined reference-bearing terms and terms explicitly defined as IRI-valued may be
relocated.

With `source` routing, each carried form's relative `href` MUST be resolved against the
source's effective `base`, or the source document URI if no `base` is declared. The resolved
view MUST carry an absolute `href` for that form, and MUST NOT declare a root `base` that
changes the carried form's meaning.

With `projection` routing, the selected affordance's forms are served by the projection
endpoint. An explicitly selected affordance MUST provide forms; for bulk and predicate
selections, the projection host MUST supply forms while resolving the view. Such forms are
resolved against the plan's effective base.

### 7.4 Context preservation

The resolved root retains the plan's effective JSON-LD context. Each imported subtree
retains the effective ordered, local, and term-scoped context of its original owner. Source
data and security definitions retain source contexts. Plan-owned forms and their dependencies
retain the plan's context.

Compact prefix spelling alone does not establish namespace identity. Equal prefix spellings
in different owner scopes are not by themselves a conflict. Selection predicates
and reference comparisons MUST use expanded semantic identities. A processor MAY serialize
scoped context differences or equivalent deterministic namespace-qualified names, provided
that it preserves opaque lexical values and the original context interpretation.

## 8. Routing and security

`wotproj:routing` is declared per source and has the value `source` or `projection`. The
default is `source`.

Under `source` routing, an imported affordance uses the source's endpoint and effective
security. A source-routed selection MUST NOT carry its own `forms` or `security` annotation.
If it does, the plan is invalid; a processor MUST report the error rather than ignore those
members. Complete local affordances are not subject to this restriction.

Under `projection` routing, the projection host serves the imported affordance. An explicit
selection MUST provide its forms and security. For bulk or predicate selection, the host
supplies forms and security during resolution. Projection-owned forms and their references
use the plan's context and base.

A source form MUST NOT inherit credentials or security defaults from the plan. The processor
MUST preserve the form's effective security according to the applicable TD/TM rules,
including any inherited source-level security. It MUST NOT invent or weaken a security
policy; a missing, cyclic, or contradictory security dependency MUST fail resolution.
An absent source security declaration is not permission to manufacture anonymous access.
Every carried executable form MUST state its own qualified effective security. Under
`projection` routing, only explicitly authored or host-supplied forms use the qualified plan
security; a source form MUST NOT be reused with plan credentials.

Source-owned security definitions are qualified in the result as
`q:s:<encoded-source-name>:<encoded-scheme-name>`. Plan-owned security definitions use
`q:p:<encoded-scheme-name>`. Encoding operates on exact UTF-8 bytes, leaves only RFC 3986
unreserved characters unchanged, and percent-encodes all other bytes with uppercase
hexadecimal digits without Unicode normalization. All references, including nested security
combinations and issued-token references defined by WoT vocabularies, MUST be rewritten
consistently. Identical repeated references reuse one definition; contradictory definitions
MUST fail resolution.

Retrieval authorization for the plan and sources is distinct from the security needed to
interact with affordances. Retrieval credentials MUST NOT be copied into the resolved
document.

## 9. Source changes and security considerations

A projection may change its resolved result when a source changes. A source digest pins
exact source bytes, while a source requirement constrains compatibility and revision
selection as described in Section 4. A publication snapshot additionally fixes
dependency bindings and their metadata; it does not waive those requirements.
This proposal does not define
notifications or continuous synchronization.

Projection-aware processors may retrieve multiple documents using author-supplied URIs.
Implementations SHOULD apply safe-fetching policies for allowed network destinations,
redirects, response size, retrieval time, and recursive resolution. The detailed policy and
limits require review with WoT processing guidance.

Resolved views may reveal a combined set of affordances from multiple documents. Authors
and processors should consider whether this combined view discloses information to consumers
who would not otherwise receive the individual sources.

## 10. Example

The example in Section 3 selects properties of a pump by predicate and adds a title and
an RDF class to the explicitly selected `pumpSpeed` property. Its `viewStatus`
property is local to the projection plan. Resolution imports selected source definitions,
applies the permitted annotations, preserves each source's forms and security under
source routing, retains provenance for imported properties, and combines them with the
complete local property definition.

The result is an ordinary TD, because the plan's root type includes `Thing`. It has no
projection marker, source manifest, or unresolved selectors. The source documents are
unchanged.

## 11. Open issues

1. Review the experimental vocabulary before any standards assignment; define an
   explicit migration if a different namespace or term set is adopted.
2. Define validation for marked TD/TM envelopes and selectors that are not yet complete
   affordance definitions.
3. Complete the list of known document-local dependencies and extension reference rules.
4. Define how a projection host supplies forms and security for projection-routed bulk and
   predicate selections, and review whether both routing modes preserve TD/TM security
   semantics.
5. Define safe-fetching requirements and limits for recursive plan resolution.
6. Determine what implementation and interoperability evidence is needed before adoption.

[Versioned-reference proposal]: ../td-versioned-references/spec.md#3-vocabulary-and-json-ld-context
