# WoT Publications and Versioned References

> **Status:** Working draft for discussion. This document is a proposal, not a W3C specification.
>
> `tm:minVersion`, `td:minVersion`, and the processing rules below are provisional. This proposal defines no core WoT terms for incremental requirements; Section 3.1 gives an OPC UA deployment mapping. Normative terms state proposed requirements and do not imply Working Group adoption.

## Abstract

Publish related Thing Models (TMs) and Thing Descriptions (TDs) as a complete immutable snapshot, then expose that snapshot through a named channel. A consumer opens the channel once and interprets every dependency through the snapshot's exact bindings. Publishing a later snapshot does not change an operation already using an earlier one.

This proposal defines WoT dependency closure and compatibility acceptance within that publication flow, independently of the registry or transport publishing it. SemVer floors and incremental compatibility lines constrain acceptance of bound revisions; they do not choose another revision from outside the snapshot. Standalone live resolution and raw exact replay remain separate operations. The proposal does not define a publication API or manifest format.

## 1. Scope and conformance

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, NOT RECOMMENDED, MAY, and OPTIONAL in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14), comprising RFC 2119 and RFC 8174, when, and only when, they appear in all capitals.

The proposed requirements apply to authors of versioned TM and TD references, publishers of WoT-complete snapshots, publication consumers, and version-aware resolvers. Ordinary processors that do not implement this proposal are outside its conformance scope. A processor claiming constrained-resolution support MUST either satisfy every applicable profile-specific requirement or report an error; it MUST NOT report unconstrained retrieval as successful constrained resolution. Raw exact retrieval is a separate operation.

The proposal covers `tm:extends`, `tm:submodel`, ordinary `tm:ref`, and TD links whose `rel` is `type`, as well as TD-to-TD `td:extends`, `td:subthing`, and ordinary `td:ref`. Projection source-manifest entries use the same target-profile contract. It does not define requirements for other TD links, registry storage, a discovery protocol, a publication API or format, or a new TD/TM media type. Version selection chooses the target document; existing composition, inheritance, JSON Pointer, and target-kind rules continue to govern its use.

This proposal leaves the TD 1.1 `Link` model and link serialization unchanged ([Sections 5.3.4.1](https://www.w3.org/TR/wot-thing-description11/#link) and [6.3.8](https://www.w3.org/TR/wot-thing-description11/#link-serialization-json)). The existing `VersionInfo` model and `version` serialization also remain unchanged ([Sections 5.3.1.6](https://www.w3.org/TR/wot-thing-description11/#versioninfo) and [6.3.3](https://www.w3.org/TR/wot-thing-description11/#version-serialization-json)). TM versioning, extension and import, and composition remain defined by [Sections 9.3.1](https://www.w3.org/TR/wot-thing-description11/#thing-model-versioning), [9.3.2](https://www.w3.org/TR/wot-thing-description11/#thing-model-extension-import), and [9.3.3](https://www.w3.org/TR/wot-thing-description11/#thing-model-composition). The separate [TD Composition and Reuse proposal](../td-composition/spec.md) defines the `td:extends`, `td:subthing`, and `td:ref` operators; this proposal defines version selection for their targets.

Section 2 describes the primary publication and consumption flow. Sections 3–5 define the reference requirements checked against a snapshot's bound targets. Section 6 covers the distinct live-selection and raw-replay paths. Section 9 maps these contracts to xRegistry without making its publication protocol a WoT requirement.

<a id="2-terminology"></a>

## 2. Publication model

**Snapshot:** An immutable publication set fixing document revisions, relevant metadata, original reference bases, contexts, and exact dependency bindings.

**Channel:** A scoped mutable name selecting a snapshot. Its name does not assert compatibility.

**Dependency binding:** An association from one external reference occurrence in an exact source revision to an exact target revision within the snapshot.

**Target identifier:** The stable `id` of the referenced TM or TD. In the SemVer profile, a TM identifier names a compatibility major. An incremental TM can retain its identifier across compatibility lines. A TD identifier names a concrete Thing.

**Version profile:** The provider-declared rules for revision identity, ordering, and compatibility selection: `semver` or `incremental`.

**Candidate:** An available revision of the target document, its exact bytes, and the trusted provider metadata needed to interpret its profile. SemVer resolution normally compares the authored `version.model` for a TM or `version.instance` for a TD; incremental resolution compares the provider's integer revision.

**Floor:** The optional minimum target revision. Comparison uses the target profile's order, not lexical order or publication time. A SemVer TD floor also limits selection to the floor major.

**Compatibility line:** An absolute URI declaring backward compatibility among incremental revisions in one authoritative sequence. Line URIs are compared exactly and case-sensitively; they have no order.

**Resolution record:** Consumer- or resolver-owned output identifying the target, selected revision, exact-byte digest, origin and applicable profile and line expectations. Retaining the record allows verification of a later replay.

<a id="9-publication-and-registry-mappings"></a>

### 2.1 Publishing and consuming a set

The primary publication flow exchanges a complete set, not a request to find the newest revision independently for every reference. The publisher prepares exact dependency bindings before making a snapshot visible. The consumer follows the channel to that snapshot and uses those bindings throughout the operation.

1. The publisher starts from a retained snapshot or a captured source release, publishes changed document revisions and reuses unchanged ones.
2. The publisher resolves recognized dependencies, records their exact occurrence bindings, and validates the complete set under Sections 2.2 and 2.3.
3. The publication mechanism persists the immutable snapshot and necessary content, then conditionally advances the channel under Section 2.4.
4. The consumer opens that channel once, retains the selected snapshot context, and obtains entries and dependencies from it.
5. The consumer validates each bound target against the source reference and its own acceptance policy before applying the existing composition operator.

For example, `preview` points to snapshot S12, containing entry E with its dependency bound to revision 42 in compatibility line A. A publisher prepares S13, reusing unchanged documents and binding E to revision 44/A. Only after validating and retaining S13 does it conditionally move `preview`. A reader already on S12 continues using 42/A; a new open selects S13 and evaluates 44/A. Promotion can point `stable` at that same reviewed S13 without allocating another document revision.

The channel chooses which publication to evaluate. The snapshot's binding chooses the exact dependency revision. A floor or compatibility line determines whether that revision is acceptable; it does not redirect the consumer to a newer live candidate. If S13 instead binds the dependency to 43/B while E requires A, composition fails.

| Operation | Selection authority | Requirement handling |
| --- | --- | --- |
| Open a channel and compose | One selected snapshot and its exact dependency bindings | Validate each bound target; no live or older-snapshot fallback |
| Standalone live resolution | The selected provider sequence and its sticky-default or highest-eligible rules | Use the requirements to select a candidate under Section 6.1 |
| Raw exact replay | The caller's source-scoped revision or digest pin | Verify identity, bytes and recorded expectations under Section 6.2; do not claim compatibility-checked composition |

Channels and snapshots do not require new channel members in authored TD/TM references. The caller supplies the publication context through its publication mechanism; authored target identifiers and reference requirements remain portable.

<a id="91-publication-sets-and-dependency-closure"></a>

### 2.2 Publication sets and dependency closure

Publishing one changed document does not require assigning new revisions to every document in a release. A publisher can reuse unchanged revisions and capture a complete set in a new snapshot. A source standard's release or a server's model revision is capture provenance, not automatically a document revision or snapshot identity.

A WoT-complete publication MUST retain entry documents, their reachable recognized TM/TD dependencies, exact bytes and fixed metadata, original reference bases, and the context material needed to interpret them. Contexts MUST be retained immutably or supplied through an explicitly supported immutable context set. Merely caching documents or declaring generic registry completeness does not establish WoT dependency closure.

The publisher MUST independently enumerate external reference occurrences from
the source bytes and their captured contexts. Recognized references are TM
`tm:extends`, `tm:submodel` and ordinary `tm:ref` operators; TD `td:extends`,
`td:subthing`, ordinary `td:ref` and `rel: "type"` links; and projection-source
entries. A Projection Plans selector uses `tm:ref` in both TD and TM envelopes
to select within its declared, bound manifest source; it does not create an
independent target-selection occurrence. An ordinary external `td:ref` remains
a recognized TD dependency. Interaction endpoints, documentation URLs and
opaque extension data are not dependencies merely because they contain URIs.

Each recognized external occurrence MUST have exactly one binding to an exact target revision in the captured set. Its key is the source revision plus reference location, not only the target's authored identifier. The binding MUST preserve the authored operator and reference string, including its fragment. With RFC 6901 locations, a link occurrence identifies the link object, an ordinary reference identifies the object containing `tm:ref` or `td:ref`, and a projection source identifies its manifest entry. Two occurrences can bind the same logical target to different revisions.

The publication validator MUST verify the binding against the actual source bytes, target identity, expected kind, original base, and fragment. Bindings MUST cover the complete reachable closure without duplicate, missing, invented or unreachable edges. A reference is document-local when its URI-reference resolves against the source document's base URI to that document before its fragment is applied. Local fragment references stay within their source revision and need no external binding. Traversal MUST be bounded; cycle acceptance follows the existing operator's rules, including rejection of cyclic projection plans.

This section defines the required interpretation, not a WoT manifest serialization, signature scheme or lockfile. A publication mechanism must supply an unambiguous binding representation and signal mandatory closure semantics. A consumer requesting WoT-complete interpretation MUST reject absent or unsupported closure information as `closure-incomplete`. Conflicting trusted declarations, or different bytes or fixed metadata claiming the same source revision, MUST fail as `inconsistent-publication`.

<a id="92-exact-selection-is-not-compatibility-acceptance"></a>

### 2.3 Exact selection and compatibility acceptance

A consumer opening a channel MUST select one snapshot for the operation and retain that context for all document, dependency and collection-page reads. Refresh is a new open operation. Missing content MUST fail as `closure-incomplete`; it MUST NOT trigger live highest-version resolution, an older-snapshot search or reopening a changed channel.

Snapshot-bound composition selects the bound exact target first, then MUST validate the authored requirement and caller acceptance policy against it. Incremental targets require the line and any numeric floor. SemVer targets retain effective floors, TD major caps and prerelease eligibility. A bound target that fails an authored requirement or caller policy MUST fail as `unsatisfied`. A captured sticky default governs raw retrieval in that snapshot, not an explicit dependency binding. The raw pin bypass in Section 6.2 MUST NOT be used to waive snapshot compatibility acceptance.

<a id="93-lifecycle-offline-replay-and-federation"></a>

### 2.4 Lifecycle, offline replay and federation

The publication mechanism MUST validate and retain a complete immutable snapshot before exposing it through a channel head. A head update MUST be conditional on the observed channel state; a stale update fails rather than overwriting another publisher. Forking can share a snapshot, promotion can select the already reviewed snapshot, and rollback can restore an earlier snapshot without renumbering documents. Existing readers remain on their selected contexts. A timeout leaves the update outcome unknown until reconciled with authoritative state; it is not permission to repeat anonymous uploads.

Offline replay requires the checked snapshot description, metadata, contexts, dependency bindings and exact bytes. Missing required closure material MUST fail as `closure-incomplete`; corrupt or untrusted material MUST fail without network fallback. Retention and authorization remain deployment policy; deletion or revocation can make an old pin unavailable and MUST NOT cause silent substitution.

A federated provider MUST establish the owning source sequence before domain revision selection. Under xRegistry's informative mapping, local/ordered precedence selects a whole Resource and its Versions; a missing Version, compatibility failure or denied access cannot be repaired from a lower-priority source. Multiple source pins alone do not reproduce the combined view: the interpreted model and exact composition policy must also be retained, or the producer must materialize a complete combined snapshot.

Independent source captures are not a simultaneous capture. A publisher claiming source-wide consistency MUST retain evidence of the source's capture guarantee; immutable output alone is insufficient. Original domain reference bases MUST survive relocation, independently of storage paths or catalog URLs.

## 3. Vocabulary and JSON-LD context

The following requirements describe what a consumer checks against a snapshot's exact dependency targets and what a publisher or standalone live resolver uses when choosing those targets. They do not replace the publication selection in Section 2.

The proposed SemVer term `tm:minVersion` uses the Thing Model namespace `https://www.w3.org/2019/wot/tm#`; `td:minVersion` uses the Thing Description namespace `https://www.w3.org/2019/wot/td#`. Both are string-valued members, not IRI-valued references, and both use the same syntax: a valid [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html) version without build metadata. For example, `1.2.0` and `1.3.0-rc.1` are valid; `1.2`, `v1.2.0`, `^1.2.0`, `>=1.2.0`, and `1.2.0+build.7` are invalid. SemVer's numeric and prerelease identifier rules, including the restrictions on leading zeroes, apply. The provider-generated bookkeeping form `0.0.0-N` MUST NOT be used as a floor, even if the corresponding revision is absent. Registry-specific identifier length limits are not WoT vocabulary constraints.

| Location | Cardinality | Meaning |
| --- | --- | --- |
| TM link with `rel: "tm:extends"` | 0..1 | Floor for the parent TM |
| TM link with `rel: "tm:submodel"` | 0..1 | Floor for the child TM |
| Object containing ordinary `tm:ref` | 0..1 | Floor for the TM containing the referenced definition |
| TD link with `rel: "type"` | 0..1 | Explicit TM floor; required when several type links target SemVer TMs and the TD has `version.model` |
| TD link with `rel: "td:extends"` or `rel: "td:subthing"` | 0..1 | Floor for the target TD |
| Object containing ordinary `td:ref` | 0..1 | Floor for the target TD containing the referenced definition |
| Projection source-manifest entry with a TM target | 0..1 | Floor for the source TM |
| Projection source-manifest entry with a TD target | 0..1 | Floor for the source TD |

`tm:minVersion` MUST occur on a TM link object, as a sibling of `tm:ref` in the same object, or on a Projection Plans source-manifest entry whose expected media type identifies a TM. `td:minVersion` MUST occur on a `td:extends` or `td:subthing` link object, as a sibling of `td:ref` in the same object, or on a source-manifest entry whose expected media type identifies a TD. The value of either `tm:ref` or `td:ref` is a URI-reference string, not a wrapper object. A floor controls target selection and MUST NOT be copied into an imported definition. A floor term used with the other target kind, or outside these locations, MUST fail as `invalid-floor`.

The examples extend the TD 1.1 context with an explicit prefix and string mapping:

```json
{
  "@context": [
    "https://www.w3.org/2022/wot/td/v1.1",
    {
      "tm": {
        "@id": "https://www.w3.org/2019/wot/tm#",
        "@prefix": true
      },
      "td": {
        "@id": "https://www.w3.org/2019/wot/td#",
        "@prefix": true
      },
      "tm:minVersion": {
        "@id": "https://www.w3.org/2019/wot/tm#minVersion",
        "@type": "http://www.w3.org/2001/XMLSchema#string"
      },
      "td:minVersion": {
        "@id": "https://www.w3.org/2019/wot/td#minVersion",
        "@type": "http://www.w3.org/2001/XMLSchema#string"
      }
    }
  ]
}
```

The context declares the term's mapping; it does not standardize the term or implement resolution. Adoption requires changes to the vocabulary, contexts, validation schemas, and processor behavior. Compact link relation spellings such as `tm:extends` follow the TM link-relation rules. A JSON-LD prefix declaration alone does not define how to expand arbitrary `rel` strings. `type`, `successor-version`, and `latest-version` are link relation names, not proposed TM terms.

### 3.1 Incremental requirements and deployment mapping

The incremental contract requires a target compatibility-line selector and permits an integer floor at the same supported reference locations. Root line metadata declares the containing revision's line; reference-level metadata selects the target's line. The root declaration MUST NOT be inherited by dependencies. This proposal defines no core WoT terms for these members; Section 3.1 gives an OPC UA deployment mapping and does not invent a `tm:compatibilityLine` or `td:compatibilityLine` term.

The informative xRegistry design proposes this deployment mapping in the existing OPC UA WoT Binding namespace:

```json
{
  "@context": {
    "uav": "http://opcfoundation.org/UA/WoT-Binding/",
    "uav:minVersion": {
      "@id": "uav:minVersion",
      "@type": "http://www.w3.org/2001/XMLSchema#string"
    },
    "uav:compatibilityLine": {
      "@id": "uav:compatibilityLine",
      "@type": "@id"
    }
  }
}
```

This is a proposed context excerpt, not a complete TD/TM context or evidence that a published context supports the terms. `uav:minVersion` serves either target kind. The existing operator, type link or source media type still determines TD versus TM. For a SemVer target it maps to the applicable SemVer floor; for an incremental target it maps to the numeric floor. `uav:compatibilityLine` is valid only for incremental selection or an incremental root declaration. A malformed line URI, a line on a SemVer target, or a line at an unsupported location MUST fail as `invalid-line`.

A processor implementing this mapping MUST normalize one accepted spelling into one requirement. A reference carrying both `uav:minVersion` and either legacy floor term MUST fail as `invalid-floor`, even if the values agree. The legacy terms retain their target-kind restrictions and MUST NOT be reinterpreted as integer floors. Authors MUST NOT duplicate composition or type links to carry alternate vocabulary spellings. Structural authoring validation is separate from the raw pin selection path in Section 6.

## 4. Model identity and compatibility

A version-aware resolver MAY use a registry, a local model catalog, or another source of candidates. How it discovers candidates or maps a retrieval URI to a target identifier is outside this proposal. It MUST establish the target identity and one authoritative source sequence before comparing revisions. It MUST NOT combine candidates with different `id` values or independent incremental sequences merely because their authored identifiers match.

The provider MUST declare the profile for its candidate set through an established endpoint or catalog contract. A legacy provider supporting only this proposal's SemVer rules MAY omit that declaration; absence means SemVer only under that legacy contract. An unknown or unavailable profile MUST fail version-aware resolution as `unknown-profile`. A processor MUST NOT infer a profile from integer-looking content or switch profiles per document. Profile provisioning and revision allocation are provider responsibilities, not WoT document syntax.

### 4.1 SemVer profile

A TM author MUST use a new `id` for a breaking change, including a change that makes an earlier version's valid use incompatible. All versions published under one TM `id` MUST be backward compatible with earlier versions under that identifier. The major compatibility line belongs in the identifier; an identifier such as `urn:example:pump:v1` distinguishes it from `urn:example:pump:v2`. This proposal does not prescribe an identifier syntax or require a literal `v1` suffix.

A TM's authored SemVer major-version change MUST use a new `id`. Minor and patch changes under one TM `id` MUST preserve backward compatibility. A resolver MUST NOT search a successor identifier to satisfy a floor on the original identifier, even if that successor has a numerically higher version.

For a TD, `id` identifies a concrete Thing and does not carry a compatibility major. A breaking revision therefore retains the TD `id` and advances the major component of `version.instance`. The TD's `version.model` remains the implicit floor only for its `rel: "type"` TM link; it does not provide an implicit floor for TD-to-TD references.

An authored version used for SemVer comparison MUST satisfy Section 3's syntax. A provider MAY explicitly support generated SemVer bookkeeping revisions for unchanged documents lacking an authored SemVer version. Such revisions are prereleases, not authored compatibility promises, and cannot be floors. They require prerelease opt-in, a raw pin or a sticky default to be selected. A resolver MUST NOT invent a candidate version when the provider supplies neither a valid authored version nor an explicitly supported generated revision. Assignment syntax and storage lineage belong to the provider profile; Section 9 describes xRegistry's mapping.

An authored TM version comes from `version.model`; an authored TD version comes from `version.instance`. A TD's `version.model` supplies a floor only for its `rel: "type"` SemVer TM link. Apart from explicitly supported generated bookkeeping revisions, an internal storage label does not supply a SemVer candidate version. A version number is an author's compatibility claim, not evidence of compatibility or document authenticity. Authors SHOULD validate compatibility before publication.

### 4.2 Incremental profile

An incremental revision and floor MUST be canonical positive decimal strings matching `[1-9][0-9]*`. A resolver MUST compare them as integers without rounding or fixed-width overflow; decimal length followed by ordinal comparison is sufficient. The provider's revision, not the document's authored version label, supplies the ordering key.

A publisher can supply unchanged bytes with an absent, integer, SemVer or free-form authored version. The provider MUST preserve those bytes and bind the assigned revision, profile, origin, exact digest and effective compatibility line through trusted metadata. If the bytes declare a root line and authorized publication metadata also declares one, the publisher MUST reject disagreement as `inconsistent-publication`. Each revision fixes its line membership, including absence; changing that declaration requires another revision.

A later revision in one line claims backward compatibility with every earlier revision in that line. A breaking change uses another line; the target's `id` can remain unchanged for either a TM or TD. Neither integer order, lineage nor the line label proves semantic compatibility. Publisher authorization and compatibility validation remain separate obligations.

A revision without a line MAY be stored and retrieved exactly, but MUST NOT participate in automatic line selection. The publishing boundary MUST report that limitation. A provider assigning revisions MUST prevent reuse within the same source sequence, including after deletion or restart; the durable allocation mechanism and upload retry protocol are outside this proposal. Copying to an independent sequence requires an explicit mapping before old numeric floors or pins can be reused.

An offline catalog or cache supplying declarations absent from the bytes MUST retain their trusted association with the exact revision and digest. A digest alone does not authenticate a profile, publisher or line.

## 5. Determining the floor

Sections 5.1–5.4 retain SemVer requirements. Section 5.5 defines incremental line selection and numeric floors.

### 5.1 Explicit TM-reference floors

A TM author MAY include `tm:minVersion` on a `tm:extends` or `tm:submodel` link, or beside an ordinary `tm:ref`. The floor applies to the target TM as a whole. For an external `tm:ref`, the resolver MUST select the document version before evaluating the fragment's JSON Pointer. A selected version lacking the required definition MUST fail reference resolution; the processor MUST NOT retry an older version to find the definition.

For a document-local `tm:ref`, the target is the containing TM already being processed. If `tm:minVersion` is present, the processor MUST check that TM's `version.model` against it and fail if the version is missing, invalid, or below the floor. It MUST NOT substitute another version of the containing document to satisfy a local reference.

An omitted floor imposes no minimum version. When version resolution is requested, the eligibility and highest-version rules in Section 6 still apply. Omission does not imply `0.0.0`, an exact pin, or permission to cross identifiers.

### 5.2 Exactly one TD type link

Before deriving type-link floors, a resolver MUST determine the target profiles of the TD's type links. When exactly one of those links targets a SemVer TM and the TD has `version.model`, that value MUST be treated as the floor for that link. The value MUST satisfy Section 3's version syntax. It states the model version needed by the TD, not an exact revision to retrieve.

The link MAY also carry `tm:minVersion`. If both an explicit and an implicit floor apply, both MUST be satisfied: the effective floor is the greater value by SemVer precedence. An explicit lower value MUST NOT weaken the TD's implicit floor. Prerelease eligibility is determined from that effective floor.

If `version.model` is absent, the link's explicit floor applies when present. The model link MUST target a TM for this algorithm; a non-TM target causes an error rather than an unconstrained model match.

### 5.3 Several TD type links

When several type links target SemVer TMs and the TD has `version.model`, each SemVer link MUST carry its own explicit floor. If any SemVer link lacks that member, unpinned resolution MUST fail as `ambiguous-floor`, including when resolving a different, fully specified link. When every SemVer link has an explicit floor, the effective floor for each MUST be the greater of its own floor and the TD's `version.model` by SemVer precedence. The resolver MUST validate both values and determine prerelease eligibility from the effective floor. It MUST NOT use `version.model` in place of a missing per-link floor.

A TD without `version.model` has no implicit floor. Each SemVer type link MUST use its own explicit floor if present, and otherwise has no floor. A missing floor in this case MUST NOT produce `ambiguous-floor`; TDs with several unversioned SemVer type links can be resolved without adding floors. Each link is resolved independently against its own target TM.

These implicit-floor and ambiguity rules apply only to the SemVer-target subset. With one SemVer link and one incremental link, only the SemVer link receives the implicit model floor. Each incremental link independently requires its own line and OPTIONAL numeric floor under Section 5.5. An unknown target profile MUST fail rather than removing that link from consideration.

If a TD has no `type` links, the resolver has no link to which it can attribute an implicit floor. This proposal does not infer a target from `version.model` alone or change ordinary TD validation for that case.

### 5.4 TD-to-TD floors

A TD author MAY include `td:minVersion` on a `td:extends` or `td:subthing` link, or beside an ordinary `td:ref`. The floor applies to the target TD as a whole. It MUST use the syntax in Section 3 and MUST NOT use the generated `0.0.0-N` form. A `td:minVersion` on a TM reference or a `tm:minVersion` on a TD-to-TD reference MUST fail as `invalid-floor`.

A TD floor is a caret floor. For a floor `X.Y.Z`, the selected version MUST be greater than or equal to `X.Y.Z` and lower than `(X+1).0.0`; the major component is incremented for all values of X, including `0`. The cap excludes prereleases whose major is `X+1`. For example, `0.4.2` admits versions from `0.4.2` up to but not including `1.0.0`. A TD reference without a floor has no implicit lower or upper bound and MAY resolve across major versions. Neither the referencing TD's `version.instance` nor its `version.model` supplies a floor for a TD target. Prerelease eligibility follows Section 6.1.

For a document-local `td:ref`, the target is the containing TD already being processed. If `td:minVersion` is present, the processor MUST check that TD's `version.instance` against the floor and the next-major cap. A missing authored version, or one below the floor or outside the cap, MUST fail as `unsatisfied`; an invalid authored version MUST fail as `invalid-version`. The processor MUST NOT substitute another version of the containing TD to satisfy a local reference.

Assuming the context from Section 3, the following abbreviated JSON excerpts use `...` for unrelated members and are not standalone TD documents. A TD with one type link and `version.model: "2.3.0"` can also state a lower explicit floor; the effective floor remains `2.3.0`:

```json
{
  "version": { "model": "2.3.0" },
  "links": [
    {
      "rel": "type",
      "href": "https://example.net/models/pump.tm.jsonld",
      "tm:minVersion": "2.1.0"
    }
  ],
  ...
}
```

A TD composition link can constrain its target to the `1.x` major line:

```json
{
  "links": [
    {
      "rel": "td:extends",
      "href": "https://example.net/things/pump-base",
      "td:minVersion": "1.4.2"
    }
  ],
  ...
}
```

### 5.5 Incremental references

An unpinned reference to an incremental TM or TD MUST explicitly select a compatibility line. It MAY state a numeric minimum revision. A floor without a line, or a reference with neither, MUST fail as `compatibility-required`. Omission of the floor imposes no minimum; it does not imply revision `1`.

Neither the referencing document's `version.model`, `version.instance` nor root line supplies a requirement for an incremental target. There is no SemVer major cap or prerelease filter. A line selector on a SemVer target, an invalid line URI, or a selector at an unsupported location MUST fail rather than be ignored.

A malformed numeric floor MUST fail as `invalid-version`. A floor without a line, or an unpinned incremental reference with neither a line nor a floor, MUST fail as `compatibility-required`. An invalid line URI, a line selector for a SemVer target, or a selector at an unsupported location MUST fail as `invalid-line`. Structural conflicts between accepted vocabulary forms MUST fail as `invalid-floor`. These names identify resolution outcomes, not a new protocol error envelope.

The following abbreviated link uses the deployment mapping from Section 3.1, not proposed core WoT term names:

```json
{
  "rel": "td:extends",
  "href": "urn:example:pump:base",
  "uav:compatibilityLine": "urn:example:pump:control-a",
  "uav:minVersion": "42"
}
```

The same requirements can qualify TM operators, TD type links, ordinary reference objects and projection source entries. For `tm:ref` or `td:ref`, the requirement members are siblings of the string-valued reference. Selection precedes fragment evaluation. A document-local reference checks the containing revision's line and floor without substituting another revision. A missing fragment target or failed requirement MUST fail composition.

## 6. Resolution semantics

Publication consumers use the exact-binding and acceptance flow in Section 2. This section defines standalone live selection and raw exact replay; neither is a fallback for missing or incompatible snapshot content.

### 6.1 Selection

For standalone live resolution, a resolver MUST apply these steps in order:

1. Establish the target identifier, expected kind, authorized source and candidate sequence. A missing target fails as `not-found`. Validate candidate identity and representation; invalid candidates MUST NOT be treated as eligible.
2. If the caller supplies a raw exact pin, retrieve it under Section 6.2 before floor derivation or default selection. Do not use this bypass for snapshot-bound composition.
3. Determine the target profile and derive the applicable requirements under Sections 3–5. For multiple SemVer type links, report missing explicit floors as `ambiguous-floor` before validating individual floor values.
4. If the provider declares an operator-selected sticky default, use that exact revision. Fail if it is unavailable or violates the line, floor or TD major cap. Do not replace it with another revision. A sticky SemVer choice bypasses prerelease filtering, but not the floor or cap.
5. Otherwise, for SemVer targets, exclude prereleases unless the effective floor is a prerelease or the consumer explicitly opts in. Exclude versions below the floor and, for a floored TD, versions whose major is at least `floor.major + 1`, including next-major prereleases. Select the highest remaining version by SemVer precedence.
6. Otherwise, for incremental targets, restrict candidates to the required line and optional numeric floor, then select the highest integer revision. Generated integer revisions are ordinary candidates, not prereleases.
7. Fail as `unsatisfied` if no eligible revision exists. Complete ordinary reference processing against the selected document, including its fragment and dependencies, or report an error.

A non-sticky raw retrieval default, publication order or retrieval order MUST NOT replace profile-specific selection. A provider that cannot expose the profile or default policy needed for constrained resolution MUST report unsupported resolution rather than treat raw retrieval as a successful match.

A release has higher precedence than prereleases of the same major, minor, and patch values. Numeric prerelease identifiers are compared numerically under SemVer; for example, `1.3.0-rc.10` has higher precedence than `1.3.0-rc.2`. A prerelease such as `1.2.0-rc.1` is below a release floor of `1.2.0`, even when the consumer opts in.

If no eligible candidate satisfies the requirements, resolution MUST fail. A resolver MUST NOT downgrade below the floor, cross a cap, discard an invalid requirement, bypass a sticky default, substitute a different identifier, or report a partial composition as successful. Conflicting bytes or fixed metadata claiming the same source revision identity MUST produce an inconsistent-publication error.

### 6.2 Resolution records and reproducibility

A successful resolution MUST return a record containing the target identifier, selected revision, a cryptographic digest of the selected document's exact bytes, and the source origin/sequence. The record MUST identify the applicable profile and effective line when incremental expectations apply. A consumer requiring reproducibility MUST retain the revision, digest and applicable metadata expectations. The digest algorithm and digest MUST be identified; SHA-256 is RECOMMENDED. The resolver MUST NOT canonicalize or transform the bytes before calculating an exact-bytes digest.

A raw exact retrieval selects a revision by its source-scoped revision identifier or exact digest. It bypasses floor derivation, line selection, the TD major cap, prerelease filtering and sticky-default selection; it still requires the source identity, authorization, exact bytes and recorded metadata to match. Conflicting bytes or fixed metadata for one source revision MUST fail as `inconsistent-publication`. Missing pinned content MUST fail without an unpinned fallback.

A bare digest can match identical bytes in several revisions or lines. The resolver MUST select the highest matching revision under the known profile; that result pins bytes, not a particular line membership. To replay a particular publication, the consumer uses its revision identifier and verifies its retained digest and metadata expectations. A richer stored record does not require an API to accept both revision and digest selectors; xRegistry currently accepts at most one selector kind per request.

For standalone live resolution, the consumer selects newer candidates through a new unpinned resolution and retains a new record. A publication consumer instead opens the channel again to evaluate its newly selected snapshot. Refresh and deployment activation are separate caller operations. Snapshot-bound composition follows Section 2.3: an exact binding fixes the candidate but does not bypass compatibility acceptance.

The resolver's selected version and digest MUST NOT be written into the authored WoT document as a pin for these references. A resolver MUST NOT replace the floor with the selected version or rewrite the target to a registry-specific revision identifier. Keeping the authored requirement separate from the resolution result allows the document to be used across catalogs and registries.

This separation does not prohibit the distinct, explicitly authored `wotproj:sourceDigest` mechanism in the projection proposal; its interaction is specified in Section 8.2. An exact source-bytes pin does not automatically pin the source's transitive dependencies. Reproducible dependency resolution requires retaining a resolution record for every version-resolved dependency.

### 6.3 Resolution cases

These cases assume SemVer unpinned resolution of one target identifier and no sticky default. A dash in the floor column means the reference omits a floor.

| Available authored versions | Floor | Consumer allows prereleases | Result |
| --- | --- | --- | --- |
| `1.0.0`, `1.1.0`, `1.0.1` | `1.0.0` | No | `1.1.0`, independent of publication order |
| `1.1.0` | `1.2.0` | No | Failure: unsatisfied floor |
| `1.2.0`, `1.3.0-rc.1` | `1.2.0` | No | `1.2.0` |
| `1.2.0`, `1.3.0-rc.1` | `1.2.0` | Yes | `1.3.0-rc.1` |
| `1.3.0-rc.2`, `1.3.0-rc.10`, `1.3.0` | `1.3.0-rc.1` | No | `1.3.0` |
| `1.3.0-rc.2`, `1.3.0-rc.10` | `1.3.0-rc.1` | No | `1.3.0-rc.10` |
| `1.2.0-rc.1` | `1.2.0` | Yes | Failure: prerelease is below the floor |
| `1.3.0-rc.1` | — | No | Failure: no eligible release |
| `1.2.0`, `1.3.0` | — | No | `1.3.0` |
| TD target: `1.4.0`, `1.7.0`, `2.0.0` | `1.4.0` | No | `1.7.0` |
| TD target: `1.4.0`, `2.0.0` | `1.4.0` | No | `1.4.0` |
| TD target: `1.2.0`, `2.0.0` | — | No | `2.0.0` |
| TD target: `1.2.0-rc.1`, `1.3.0-rc.1`, `2.0.0-rc.1` | `1.2.0-rc.1` | No | `1.3.0-rc.1` |

A TD with one SemVer type target and `version.model: "1.2.0"` has the same result as an explicit floor of `1.2.0`. A TD with two SemVer type targets, `version.model`, and a link without an explicit floor fails attribution before candidate selection. Without `version.model`, each SemVer link uses only its explicit floor, if present.

The following cases separate incremental live selection, raw replay and publication acceptance. A and B abbreviate distinct absolute line URIs in one source sequence.

| Operation and candidates | Requirement | Result |
| --- | --- | --- |
| Live: `42/A`, `43/B`, `44/A` | Line A, no floor | `44/A` |
| Live: same history | Line A, floor `45` | `unsatisfied` |
| Live: same history | Floor `42`, no line | `compatibility-required` |
| Live: same history, sticky `43/B` | Line A | `unsatisfied`; do not select `44/A` |
| Live SemVer: `1.4.0`, `1.7.0`, sticky `2.0.0` | TD floor `1.4.0` | `unsatisfied`; do not select `1.7.0` |
| Raw replay: revision `42/A` retained | Current authored floor `44` | Retrieve `42/A`; verify retained expectations |
| Bare digest: identical bytes at `42/A` and `44/B` | Digest only | `44/B`; no line-membership guarantee |
| Snapshot binds dependency to `43/B` | Source requires A | Reject composition; no live or older-snapshot fallback |

## 7. Version-navigation links

A TD or TM MAY include links with `rel: "successor-version"` or `rel: "latest-version"` using the registered relations defined in [RFC 5829](https://www.rfc-editor.org/rfc/rfc5829.html). TD 1.1 also supports `predecessor-version`. A consumer can follow these relations to navigate a version history; they do not constrain versions or determine candidate selection.

A deprecated SemVer TM's successor link MAY identify its replacement under a new major-version identifier. An incremental TM can instead change compatibility lines under the same identifier. A latest-version link MAY locate the latest version in the corresponding version history. Neither link establishes that its target is compatible, has the original identifier, or satisfies a requirement. A resolver MUST NOT use navigation links to redirect an existing reference across compatibility lines or to override the selection rules in Section 6.

Deprecation does not itself make compatible versions ineligible. The [deprecated v1 example](./examples/tm-deprecated-v1.jsonld) states deprecation in its description and links to v2; this proposal introduces no new deprecation member or automatic migration rule.

## 8. Relationship to other proposals

### 8.1 TD Composition and Reuse

[TD Composition and Reuse](../td-composition/spec.md) Sections 5–7 define `td:extends`, `td:subthing`, and `td:ref` and their composition behavior. This proposal defines target-version selection for those operators. SemVer TD floors use `td:minVersion`, not `tm:minVersion`; a floored target is bounded to its major line, while an unfloored reference can cross majors. Incremental TD targets use an explicit line and optional numeric floor. Neither referencing TD version member supplies an implicit requirement. Version selection does not change the operator's composition semantics.

Ordinary TM composition uses `tm:extends`, `tm:submodel`, and `tm:ref` with version selection performed before the existing operator's processing. Version selection does not change inheritance, child-model semantics, overrides, context preservation, source ownership, security, or cycle handling. A version floor cannot make an otherwise invalid composition valid. When a composed TD includes type links to TMs, the type-link rules apply to those model references independently of TD-to-TD composition.

### 8.2 WoT Projection Plans

[WoT Projection Plans](../wot-projections/spec.md) defines `wotproj:sourceDigest` on a source-manifest entry as an exact-byte SHA-256 pin. The projection processor MUST verify that digest against the source bytes as retrieved, before transforming the source or resolving a nested projection plan. A mismatching or unverified digest MUST fail projection resolution; a higher model version or a satisfied floor cannot substitute for the pinned bytes.

A projection source-manifest entry MAY carry a SemVer floor or an incremental requirement as specified in the [WoT Projection Plans proposal](../wot-projections/spec.md#4-source-manifest). The entry's expected media type determines its target kind; the provider contract determines its profile. A SemVer TM floor has no upper bound, while a SemVer TD floor is capped at the next major. Incremental sources require an explicit line and permit a numeric floor. The projection envelope's `version.model`, `version.instance` and root line do not supply source requirements.

These requirements apply to manifest-source resolution, not to selector annotations. Projection selectors use `tm:ref` in both TD and TM envelopes and retain their projection-specific meaning; they do not acquire ordinary `tm:ref` floor semantics merely by sharing that member name. The projection proposal's closed selector-annotation set admits neither floors nor line selectors. Authors MUST NOT use selector-local requirements to select a different revision of a manifest source.

An ordinary `tm:ref` that is not a projection selector can carry `tm:minVersion` as specified in Section 5.1. Ordinary TM references inside a retrieved source likewise retain their floors during dependency resolution. A source's TD type-link floors are evaluated against that source's own root metadata, not against the projection envelope's `version.model`.

A source digest pins the representation retrieved from that source. If the source is an unresolved nested plan, the digest pins that plan, not its resolved result or the bytes of transitive sources or dependencies. The consumer MUST separately retain dependency resolution records or use the projection proposal's source pins at the relevant dependency boundaries when reproducibility is required.

If a resolver is given both a projection source requirement and `wotproj:sourceDigest`, both MUST be satisfied. It MUST verify the exact representation and check its profile-specific compatibility requirement, including SemVer floor/cap/prerelease rules or the incremental line and numeric floor. Different bytes fail the digest pin. Identical bytes in several incremental revisions do not establish line membership; trusted revision metadata is still required. No fallback to another source revision is permitted.

When a publication snapshot binds a projection source, the processor MUST use that exact binding and validate the source requirement and any authored digest. The digest of a nested plan does not pin the resolved view. Publication closure must cover its reachable source dependencies, with the projection proposal's acyclic-plan rule unchanged.

<a id="94-xregistry-mapping-informative"></a>

## 9. xRegistry mapping (informative)

The current [xRegistry WoT specification][xRegistry WoT] and [decision record][xRegistry decisions] define the SemVer baseline. Its [versioning design][xRegistry versioning] and [overview][xRegistry overview] propose the additional incremental profile; they do not replace that baseline specification or demonstrate runtime support. The [WoT publication companion][xRegistry WoT publication] is an informative closure design, while the separate [generic publication working draft][xRegistry publication] defines xRegistry-specific manifests, channels, conditional updates and access contexts. All remain unreleased drafts.

In the SemVer mapping, TM `version.model` and TD `version.instance` supply `versionid` when valid; missing or non-SemVer values receive `0.0.0-N` with the lowest unused positive N. The provider records `versionorigin` without rewriting document bytes. Build metadata and Core identifier-limit violations fail publication. The proposed incremental mapping uses a durable high-water mark. A canonical authored integer supplies the revision only above that mark; an older integer fails new publication. An absent or non-integer authored value instead receives the next integer. Both maps preserve source identity, but independent integer sequences are not interchangeable. These assignment algorithms, Core lineage aspects and identifier limits are not W3C WoT requirements.

xRegistry's generic publication model identifies a snapshot by the SHA-256 of exact manifest bytes. Its channel head is a checked manifest descriptor updated conditionally with the channel Meta epoch; rollback advances that epoch, and deleted channel Resource identities cannot be reused. Groups are organizational containers, not channels, snapshots or compatibility lines. A WoT closure extension binds source Version/reference locations to exact target Versions; this draft does not copy its XIDs or extension format into WoT vocabulary.

The [federation draft][xRegistry federation] separates source ownership, original reference bases and capture completeness. A publication HTTP projection exposes a snapshot-specific root and a checked open-context record under the [HTTP binding][xRegistry HTTP]. Git commits, OCI digests and publication IDs remain distinct; an alternate binding needs a checked association to the captured model, metadata and bytes before claiming the same publication. Read-only federation does not provide publication writes.

The checked SemVer vectors establish only their documented baseline cases. Generic publication examples exercise synthetic state and integrity; the WoT closure sample/schema checks shape, not independent closure discovery, compatibility enforcement, durable allocation or deployed cross-binding conformance.

## 10. Security considerations

A floor is not an authenticity or authorization guarantee. Resolvers SHOULD authenticate candidate publishers or apply an appropriate trust policy and SHOULD use authenticated transport. A digest detects byte changes relative to a retained trusted pin; an untrusted digest does not establish provenance.

Resolvers SHOULD enforce safe-fetching policies covering URI schemes, destinations, redirects, response size, recursion depth, retrieval time, and dependency cycles. They MUST NOT copy retrieval credentials into imported interaction security or weaken the source's security during composition. Resolver origin is provenance metadata, not authority to change a document's identity or compatibility contract.

## 11. Examples and adoption work

The [example guide](./examples/README.md) lists illustrative JSON-LD documents for SemVer floors and versions, incremental requirements, and model navigation. Example target IRIs identify externally supplied documents; the examples are not a candidate repository or an executable resolution service.

This proposal does not modify the base TD/TM context or schemas in this repository. Section 1 sets a claim-based conformance boundary; this proposal defines no protocol for discovering whether a processor makes that claim.

The SemVer floor terms remain provisional. Incremental requirements use the OPC UA deployment mapping in Section 3.1; this proposal defines no core WoT terms for them. W3C adoption requires a separate decision and corresponding vocabulary, context, schema and validation changes.

Live selection depends on a provider contract that exposes trusted profile, sequence and sticky-default metadata. Snapshot-bound composition uses the exact bindings and fixed metadata in the selected snapshot. This proposal defines neither a provider-discovery mechanism nor a publication API or manifest format. Independent implementation evidence is still required for compatibility checks, closure discovery, snapshot acceptance and offline replay; examples and schema checks do not establish those behaviors.

The source references below pin the xRegistry PR head reviewed for this alignment, `422fe3728f434db5dbcfb3b2cec29809a2b03dad` from [xregistry/spec#571](https://github.com/xregistry/spec/pull/571). A later editorial or design revision requires another comparison; the linked design prose is not normative W3C authority.

[xRegistry WoT]: https://github.com/marcschier/xregistry-drafts/blob/422fe3728f434db5dbcfb3b2cec29809a2b03dad/workingdrafts/models/wot/spec.md
[xRegistry decisions]: https://github.com/marcschier/xregistry-drafts/blob/422fe3728f434db5dbcfb3b2cec29809a2b03dad/workingdrafts/models/wot/decisions.md
[xRegistry versioning]: https://github.com/marcschier/xregistry-drafts/blob/422fe3728f434db5dbcfb3b2cec29809a2b03dad/workingdrafts/publication/design/design.md#wot-versioning-design-and-operating-workflows
[xRegistry overview]: https://github.com/marcschier/xregistry-drafts/blob/422fe3728f434db5dbcfb3b2cec29809a2b03dad/workingdrafts/publication/design/design.md#wot-versioning-design-overview
[xRegistry WoT publication]: https://github.com/marcschier/xregistry-drafts/blob/422fe3728f434db5dbcfb3b2cec29809a2b03dad/workingdrafts/publication/design/design.md#wot-channels-snapshots-and-dependency-bindings
[xRegistry publication]: https://github.com/marcschier/xregistry-drafts/blob/422fe3728f434db5dbcfb3b2cec29809a2b03dad/workingdrafts/publication/spec.md
[xRegistry federation]: https://github.com/marcschier/xregistry-drafts/blob/422fe3728f434db5dbcfb3b2cec29809a2b03dad/workingdrafts/federation/spec.md
[xRegistry HTTP]: https://github.com/marcschier/xregistry-drafts/blob/422fe3728f434db5dbcfb3b2cec29809a2b03dad/workingdrafts/bindings/http-federation.md
