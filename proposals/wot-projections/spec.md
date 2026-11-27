# WoT Projection Plans

> **Status:** Working draft for discussion. This document is a proposal, not a W3C
> specification.
>
> The experimental vocabulary below is controlled by this proposal repository,
> not assigned by W3C or the OPC Foundation. Normative terms
> (MUST, MUST NOT, SHOULD, and MAY) are used to make the proposed processing contract
> concrete; they do not imply Working Group adoption.

## Abstract

A projection plan uses a WoT Thing Description (TD) or Thing Model (TM) envelope marked
as unresolved. The plan identifies source TDs or TMs and selects affordances by reference
in the envelope's affordance maps. A projection-aware processor combines those affordances
with complete local definitions and permitted annotations to produce an ordinary TD or TM.

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
and MUST NOT report partial resolution as successful.

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
Processors use the context artifact from their explicitly selected source
revision, independently of whether the namespace URL serves that revision.

The terms are `projection`, `scenario`, `projects`, `sourceName`, `routing`,
`sourceDigest`, `namePrefix`, `selectAll`, `select`, `affordanceKind`,
`resolvedFrom`, `organizes`, `refName`, `observe`, `byProtocol`, `formTemplate`
and `resolvedFormBase`, with the meanings defined below. The context represents
`projects` as an ordered list and `scenario`, `resolvedFrom` and
`resolvedFormBase` as IRI-valued members. It scopes the unprefixed interval
members to `observe` and represents `byProtocol` and `formTemplate` as JSON
values, preserving the map's protocol keys and the template's `href` string.
Consumers MUST identify terms by their expanded IRIs, not the literal `wotproj`
prefix. The earlier `https://example.org/wot/projection#` placeholders MUST NOT
be treated as aliases for this vocabulary.

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

The example below inlines the experimental context bindings it uses:

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

### 3.1 Organizing plans

A plan MAY organize other plans by including entries in its root `links` array with the
extension relation `wotproj:organizes`. In `rel`, authors MUST use its absolute
IRI in the experimental namespace, not the compact spelling. Each organizing
link MUST have an `href` that identifies a whole marked projection plan without
a fragment and a non-empty string `wotproj:refName` unique among the organizing
links of that plan. Resolve the `href` against the organizing plan's effective
base URI. For example, with the context in Section 3:

```json
{
  "rel": "https://raw.githubusercontent.com/marcschier/wot-thing-description/main/proposals/wot-projections/context.experimental-v1.jsonld#organizes",
  "href": "./condition-signals.td.json",
  "wotproj:refName": "condition"
}
```

An organizing link names a group; it does not select a source, supply a `tm:ref` target,
or include or merge any member of the target plan. The organizing graph MUST be acyclic.
Before using a group association, the processor MUST validate the reachable organizing
graph from the organizing plan: each target MUST be a marked plan and no path may return
to the same plan document, even through a different URI alias. This traversal uses only
organizing links and does not resolve targets as affordance sources. Section 4 still
governs the separate source dependency graph.

A group association consists of the organizing plan's exact document identity and its local
`wotproj:refName`. A target MAY have more than one incoming link. When resolving a target
as an organized group, the caller MUST identify exactly one direct incoming link in the
validated graph. The processor MUST NOT infer the association from the target URI,
source manifest, or traversal order, or pass it to plans resolved as sources. The root of
the selected link's organizing plan can supply fallback observation defaults (Section 5.5).
The selected link's `wotproj:refName` supplies the `group` template variable (Section 8.1).
The host MUST distinguish group associations even when two organizing plans use the same
local name. Standalone resolution has no group association.

**Proposed scope (open for Working Group decision):** Organizing links are plan-only
metadata. Ordinary view resolution validates the links' local syntax but does not follow
them, and removes them from the result. This draft does not admit a grouping-only envelope
that lacks the otherwise required manifest or affordances. Whether to admit such envelopes,
expose links between resolved views, or add organizing links to publication snapshot closure
remains open. Until snapshot bindings for organizing links are defined, a processor MUST NOT
follow them in snapshot composition or substitute a live organizing target.

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
- `wotproj:formTemplate`: an optional form-generation template permitted only when
  `wotproj:routing` is `projection` (Section 8.1);
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
The [versioned-reference proposal][Versioned-reference proposal] defines the
permitted floor spellings and values, the SemVer TD major cap, and the explicit
line required for incremental sources. Requirements belong on the source entry,
never on an explicit affordance selector. A plan's own version and root line
MUST NOT supply source requirements. Live source selection and snapshot
composition follow the distinct
[resolution rules](../td-versioned-references/spec.md#6-resolution-semantics).

A source MAY itself be a projection plan. It is resolved before its affordances are selected.
The graph of projection plans MUST be acyclic.

The processor MUST verify every declared `wotproj:sourceDigest`, even for sources that do not
contribute to the resolved view. Verification precedes transforming a source or resolving
it as a nested projection plan. Compute SHA-256 over the exact source bytes as retrieved and
compare it to the declared value. The hexadecimal digest MUST be lowercase.
The processor MUST NOT canonicalize or otherwise transform the bytes before
hashing. A mismatch MUST fail resolution and identify the source. If the source is provided
only as an already-parsed object and its original bytes are unavailable, the processor MUST
report the pin as unverified and MUST NOT complete resolution. Checking an unused entry's
digest does not add a provenance link. A nested plan's digest pins its unresolved bytes,
not its resolved view or transitive sources.

The [versioned-reference rules for projection sources][Source digest processing]
specify how a digest combines with a version requirement and how a snapshot fixes
the selected revision. WoT-complete publication follows the
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
definition. Alongside `tm:ref`, it MAY carry the following members:

- `title` and `titles`;
- `description` and `descriptions`;
- additional `@type` values;
- `forms` and `security` under the routing rules of Section 8; and
- `wotproj:observe` on a property selector only (Section 5.5).

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

The selector's `tm:ref` and `wotproj:observe` are consumed during resolution, not copied
as affordance annotations. Any `tm:ref`, `td:ref`, or other defined reference already present
in the source affordance is not another selector. It is retained and relocated by source
identity and original reference origin according to Section 7.

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

### 5.5 Observation requests

An explicit imported property selector MAY carry `wotproj:observe` to request collection
intervals. A plan root MAY carry the same member to supply defaults for its retained imported
properties, including those selected by a bulk rule. When a target is resolved as an organized
group, the selected direct organizer's authored root values also supply fallback defaults
for those properties. A processor MUST NOT inherit defaults from any other organizer or
from an ancestor of the selected organizer. Standalone and source resolution do not inherit
organizer defaults. Defaults do not apply to local definitions, actions, or events.
`wotproj:observe` MUST NOT appear as a plan vocabulary member at any other location.

`wotproj:observe` is a JSON object that MAY contain only `samplingInterval`,
`publishingInterval`, and `wotproj:byProtocol`. Each interval value MUST be a non-negative
number in milliseconds. `wotproj:byProtocol` is an object keyed by absolute IRIs identifying
collection protocol bindings. Each override object MAY contain only the same two interval
members, with the same units and constraints. The effective request for each interval is
the first value present in this order:

1. The selector's override for the collection protocol binding, if known.
2. The selector's general request.
3. The target plan root's override for the collection protocol binding, if known.
4. The target plan root's general default.
5. The selected direct organizer's root override for the collection protocol binding,
   if resolving as an organized group and the binding is known.
6. The selected direct organizer's root general default, if resolving as an organized group.

If none of these supplies a value, there is no request for that interval. The collection
binding is the one used to acquire the source property, not the binding of the published
view. The host MAY revise requested intervals to match deployment or binding capabilities.
A request does not guarantee support or a particular delivery rate. Neither the request nor
the revised values are serialized into the resolved view by this mechanism; the processor
MUST remove `wotproj:observe` from the plan root and consume it on selectors without changing
the source definition.

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
6. Copy each selected definition with permitted annotations, derive any observation requests
   for retained properties, and obtain any host-supplied forms and security (including forms
   generated from a template).
7. Close known local dependencies of selected definitions.
8. Resolve form URIs, relocate defined references, preserve contexts and security, and record
   provenance.
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
definition is moved. Digest verification alone does not add a provenance link for an
unused source.

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

With `source` routing, the resolved view MUST carry an absolute `href` for every carried
form and MUST NOT declare a root `base` that changes its meaning.

**Proposed precedence (open for Working Group decision):** For a carried form with a
relative `href`, use the source's authored `base` when present, otherwise a
deployment-supplied base for that source occurrence when configured, otherwise the
source document URI (its retrieval URI for a retrieved source). The deployment base
therefore takes precedence over the retrieval URI only when the source has no authored
`base`; without a deployment base the existing document URI fallback applies. A configured
base selected by this rule MUST be usable as an absolute URI base under RFC 3986. If the
selected base is unusable, or no base is available, the processor MUST reject the relative
`href`.

The deployment base is a resolution input associated with the exact source selected at that
manifest occurrence, not an authored plan or source field. It MUST NOT change an absolute
`href`, a projection-owned form, the source's identity or revision, or the original
owner and origin used for any other reference, including `tm:ref` and `wotproj:resolvedFrom`.
When the processor uses a deployment-supplied base, it MUST record that base as provenance
on the form (`wotproj:resolvedFormBase`). It MUST retain that provenance
if the resulting absolute form is later carried into another view. It MUST NOT add this
provenance when using the authored `base` or source document URI, or when no base is needed.
The base and resulting `href` MUST NOT contain credentials, including URI user information.
The processor MUST reject credential-bearing inputs without disclosing credentials in
the resolved view, provenance, or error details. Authentication material is supplied
separately under Section 8.

With `projection` routing, the selected affordance's forms are served by the projection
endpoint. An explicitly selected affordance MUST provide forms; for bulk and predicate
selections, the projection host MUST supply forms while resolving the view, using the
generated absolute `href` if a form template applies (Section 8.1). Other projection-owned
form `href` values are resolved against the plan's effective base.

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

### 8.1 Form templates for bulk selections

**Proposed scope (open for Working Group decision):** This draft templates only `href`.
Whether a template should also supply other form members remains open. The host still
supplies those members and the effective security under Section 8.

A projection-routed source entry MAY provide `wotproj:formTemplate`, an object whose only
member is an `href` string containing an [RFC 6570](https://www.rfc-editor.org/rfc/rfc6570)
Level 1 URI template. For each retained whole-source or predicate selection from that
entry, the projection host MUST expand the template with these string variables:

| Variable | Value |
| -------- | ----- |
| `affordance` | The affordance's resolved name, including any bulk name prefix |
| `kind` | `property`, `action`, or `event` |
| `source` | The manifest entry's `wotproj:sourceName` |
| `group` | The selected organizing link's `wotproj:refName` (Section 3.1), if resolving as an organized group |

The template MUST NOT refer to an unknown variable. If expansion needs `group` and no
group association is supplied, resolution MUST fail. Expansion MUST produce an absolute
URI; the processor MUST NOT use a base to make a relative expansion absolute. For example,
`https://gateway.example.org/{group}/{kind}/{affordance}` could expand to
`https://gateway.example.org/condition/property/pumpSpeed`.

The host uses that URI as the `href` of the forms it supplies for the selection. It still
supplies the applicable operations, binding metadata, and effective plan-owned security
under Section 8, and MUST serve the generated forms. Template expansion does not select,
modify, or weaken that security.

Within one resolved view, two distinct affordances whose forms use the same source
entry's template MUST NOT have the same expanded `href` and the same effective operation.
Compare each effective `op` separately, including any default under ordinary TD/TM rules.
A duplicate pair MUST fail resolution. Explicit selections are not expanded or included in
this template collision check; their authored forms and security are unchanged by this
mechanism.

## 9. Source changes and security considerations

Resolving a projection again may produce a different result if a source changes. A source
digest pins the exact source bytes. A source requirement constrains compatibility and
revision selection as described in Section 4. A publication snapshot also fixes the
dependency bindings and their metadata. The bound revisions still need to meet the source
requirements. This proposal does not define notifications or continuous synchronization.

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
4. Decide whether the template for projection-routed bulk and predicate `href` values
   (Section 8.1) should cover other form members. Define how the host supplies
   operations, other binding metadata, and security, and forms when no template is
   present. Review whether both routing modes preserve TD/TM security semantics.
5. Define safe-fetching requirements and limits for recursive plan resolution.
6. Determine what implementation and interoperability evidence is needed before adoption.

[Versioned-reference proposal]: ../td-versioned-references/spec.md#3-vocabulary-and-json-ld-context
[Source digest processing]: ../td-versioned-references/spec.md#82-wot-projection-plans
