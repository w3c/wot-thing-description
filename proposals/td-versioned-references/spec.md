# WoT Publications and Versioned References

> **Status:** Working draft for discussion. This document is a proposal, not a W3C specification.
>
> `tm:minVersion`, `td:minVersion`, and the processing rules below are provisional. This proposal defines no core WoT terms for incremental requirements; Section 3.1 gives an OPC UA deployment mapping. Normative terms state proposed requirements and do not imply Working Group adoption.

## Abstract

Publish related Thing Models (TMs) and Thing Descriptions (TDs) as a complete immutable snapshot, then expose that snapshot through a named channel. A consumer opens the channel once and interprets every dependency through the snapshot's exact bindings. Publishing a later snapshot does not change an operation already using an earlier one.

This proposal defines which dependencies a WoT snapshot retains and how consumers check its bound revisions, regardless of the registry or transport. SemVer floors and incremental compatibility lines constrain which bound revisions a consumer can accept. They do not select revisions outside the snapshot. Standalone live resolution and raw exact replay remain separate operations. The proposal does not define a publication API or manifest format.

## 1. Scope and conformance

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, NOT RECOMMENDED, MAY, and OPTIONAL in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14), comprising RFC 2119 and RFC 8174, when, and only when, they appear in all capitals.

The proposed requirements apply to authors of versioned TM and TD references, publishers of WoT-complete snapshots, publication consumers, and version-aware resolvers. Ordinary processors that do not implement this proposal are outside its conformance scope. A processor claiming constrained-resolution support MUST either satisfy every applicable profile-specific requirement or report an error; it MUST NOT report unconstrained retrieval as successful constrained resolution. Raw exact retrieval is a separate operation.

The proposal covers `tm:extends`, `tm:submodel`, ordinary `tm:ref`, and TD links whose `rel` is `type`, as well as TD-to-TD `td:extends`, `td:subthing`, and ordinary `td:ref`. Projection source-manifest entries use the same target-profile contract. It does not define requirements for other TD links, registry storage, a discovery protocol, a publication API or format, or a new TD/TM media type. Version selection chooses the target document; existing composition, inheritance, JSON Pointer, and target-kind rules continue to govern its use.

This proposal leaves the TD 1.1 `Link` model and link serialization unchanged ([Sections 5.3.4.1](https://www.w3.org/TR/wot-thing-description11/#link) and [6.3.8](https://www.w3.org/TR/wot-thing-description11/#link-serialization-json)). The existing `VersionInfo` model and `version` serialization also remain unchanged ([Sections 5.3.1.6](https://www.w3.org/TR/wot-thing-description11/#versioninfo) and [6.3.3](https://www.w3.org/TR/wot-thing-description11/#version-serialization-json)). TM versioning, extension and import, and composition remain defined by [Sections 9.3.1](https://www.w3.org/TR/wot-thing-description11/#thing-model-versioning), [9.3.2](https://www.w3.org/TR/wot-thing-description11/#thing-model-extension-import), and [9.3.3](https://www.w3.org/TR/wot-thing-description11/#thing-model-composition). The separate [TD Composition and Reuse proposal](../td-composition/spec.md) defines the `td:extends`, `td:subthing`, and `td:ref` operators; this proposal defines version selection for their targets.

Section 2 describes the primary publication and consumption flow. Sections 3–5 describe what an author can write and how the target profile determines the effective requirement. Section 6 distinguishes live selection, raw exact replay, and snapshot composition. Section 9 maps these contracts to xRegistry without making its publication protocol a WoT requirement.

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

The four records below group information that already exists. They introduce no JSON objects, wire fields, or protocol messages.

| Record             | What it describes                                                                                                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Revision           | One document revision: its trusted source sequence, logical identifier, TD or TM kind, exact revision identifier, authored version label, profile, assignment origin and line where applicable, and verified content evidence. The stored identifier can differ from the authored label. |
| Requirement        | One authored reference: its operator or source media type, target and optional fragment, effective floor, explicit line where applicable, and any authored Projection source digest.                                                                                                     |
| Resolution request | Live selection, raw exact replay, or snapshot composition. The caller supplies source trust and applicable prerelease policy, replay pins, or a channel or snapshot selector; these are not authored floor or line terms.                                                                |
| Resolution result  | The exact target and its verified origin and bytes, plus occurrence and manifest evidence when composing a snapshot. The consumer can retain the result for replay. It identifies what was resolved, not what a deployment activated.                                                    |

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

A consumer opening a channel MUST select one snapshot for the operation and retain that context for all document, dependency and collection-page reads. Refresh is a new open operation. Whether the caller opens a channel or supplies an exact snapshot selector, the consumer MUST verify the snapshot description through its publication mechanism and obtain the exact occurrence binding before checking the bound target. Missing required content or bindings, or a manifest that fails its integrity check, MUST fail as `closure-incomplete`. The consumer MUST NOT select a live target, search older snapshots or reopen the channel as a fallback.

The consumer MUST validate the authored reference, verify the bound revision's identity, authority and bytes, and accept that revision only if it meets the applicable floor, line, TD major cap and prerelease policy. A valid requirement or caller policy that the bound revision does not meet MUST fail as `unsatisfied`. An authored source digest, when present, MUST also match the bound bytes (Section 8.2). A captured default can govern retrieval by identifier, but neither a default nor a different digest match overrides an exact binding. Raw exact replay (Section 6.2) does not perform these compatibility checks and is not snapshot composition.

<a id="93-lifecycle-offline-replay-and-federation"></a>

### 2.4 Lifecycle, offline replay and federation

The publication mechanism MUST validate and retain a complete immutable snapshot before exposing it through a channel head. A head update MUST be conditional on the observed channel state; a stale update fails rather than overwriting another publisher. Forking can share a snapshot, promotion can select the already reviewed snapshot, and rollback can restore an earlier snapshot without renumbering documents. Existing readers remain on their selected contexts. A timeout leaves the update outcome unknown until reconciled with authoritative state; it is not permission to repeat anonymous uploads.

Replaying a whole snapshot offline requires the checked snapshot description, metadata, contexts, dependency bindings and exact bytes. Missing required closure material MUST fail as `closure-incomplete`; corrupt or untrusted material MUST fail without network fallback. Retention and authorization remain deployment policy; deletion or revocation can make an old pin unavailable and MUST NOT cause silent substitution.

A federated provider MUST establish the owning source sequence before domain revision selection. Under xRegistry's informative mapping, local/ordered precedence selects a whole Resource and its Versions; a missing Version, compatibility failure or denied access cannot be repaired from a lower-priority source. Multiple source pins alone do not reproduce the combined view: the interpreted model and exact composition policy must also be retained, or the producer must materialize a complete combined snapshot.

Independent source captures are not a simultaneous capture. A publisher claiming source-wide consistency MUST retain evidence of the source's capture guarantee; immutable output alone is insufficient. Original domain reference bases MUST survive relocation, independently of storage paths or catalog URLs.

## 3. Vocabulary and JSON-LD context

This section defines what an author can write at one reference occurrence. Sections 5 and 6 explain how a resolver derives and applies the requirement. None of these terms selects a channel or snapshot.

The proposed SemVer term `tm:minVersion` uses the Thing Model namespace `https://www.w3.org/2019/wot/tm#`; `td:minVersion` uses the Thing Description namespace `https://www.w3.org/2019/wot/td#`. Both are string-valued members, not IRI-valued references, and both use the same syntax: a valid [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html) version without build metadata. For example, `1.2.0` and `1.3.0-rc.1` are valid; `1.2`, `v1.2.0`, `^1.2.0`, `>=1.2.0`, and `1.2.0+build.7` are invalid. SemVer's numeric and prerelease identifier rules, including the restrictions on leading zeroes, apply. The provider-generated bookkeeping form `0.0.0-N` MUST NOT be used as a floor, even if the corresponding revision is absent. Registry-specific identifier length limits are not WoT vocabulary constraints: `1.0.0-` followed by 123 ASCII `a` characters is a valid 129-character floor even where stored identifiers have a 128-character limit.

| Reference occurrence                                                       | What determines target kind?          | SemVer requirement                                                                                                                                           | Incremental requirement for live selection or composition                            |
| -------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `tm:extends` or `tm:submodel` link, or object containing ordinary `tm:ref` | Operator: TM                          | Optional `tm:minVersion`. No TD major cap. A breaking TM major has a different identifier.                                                                   | Explicit line; optional numeric floor.                                               |
| TD link with `rel: "type"`                                                 | Link selects a TM                     | `tm:minVersion` and any applicable TD `version.model` supply the floor under Sections 5.2 and 5.3. Neither is an exact pin.                                  | Explicit line; optional numeric floor. No floor from `version.model`.                |
| `td:extends` or `td:subthing` link, or object containing ordinary `td:ref` | Operator: TD                          | Optional `td:minVersion`. With a floor, the target stays within the floor's major (Section 5.4). Neither version field of the referring TD supplies a floor. | Explicit line; optional numeric floor.                                               |
| Projection source-manifest entry                                           | Entry's expected media type: TM or TD | Optional `tm:minVersion` for a TM or `td:minVersion` for a TD; the TD cap applies only to TD sources. No implicit floor from the envelope.                   | Explicit line; optional numeric floor. No line or floor inherited from the envelope. |

Authors MUST use only the floor term for the target kind and place it on the link, ordinary reference object, or source entry listed above. A floor term of the other kind, competing floor terms on one occurrence, or a floor term in any other location (including the document root or a projection selector) MUST fail as `invalid-floor`. Recognize terms by their JSON-LD identifiers in their applicable contexts, not just by their compact spelling. Do not interpret opaque payloads such as examples or default values as dependency occurrences.

The value of either `tm:ref` or `td:ref` is a URI-reference string, not a wrapper object; the requirement members are its siblings. A floor controls target selection or acceptance and MUST NOT be copied into an imported definition. An omitted floor imposes no minimum; it does not imply `0.0.0`, revision `1`, or an exact pin. A present null value is not an omitted floor and does not satisfy the required syntax. Structural authoring checks remain applicable even if the caller can retrieve a raw pin without performing them.

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

The incremental contract defines the meaning of a line selector and numeric floor, not their spelling. This proposal defines no core WoT terms for them. A deployment can also carry root line metadata: it describes the containing revision and MUST NOT be inherited by dependencies.

The following deployment-specific mapping, illustrated in the informative xRegistry design, uses the OPC UA WoT Binding namespace:

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

This excerpt is not a complete TD/TM context or evidence that a published context supports the terms. Where this mapping is supported, `uav:minVersion` can supply either kind's SemVer floor or an incremental numeric floor at the supported occurrences; the operator, type link or source media type still determines target kind. `uav:compatibilityLine` can select an incremental target's line or declare the document's own incremental line at the root. A malformed line URI, a line used with a SemVer target or at a SemVer root, or a line in an unsupported location MUST fail as `invalid-line`.

A processor implementing this mapping MUST normalize one accepted spelling into one requirement. A reference carrying both `uav:minVersion` and a portable floor term MUST fail as `invalid-floor`, even if the values agree. The portable terms retain their target-kind restrictions and MUST NOT be reinterpreted as integer floors. Authors MUST NOT duplicate composition or type links to carry alternate spellings.

## 4. Model identity and compatibility

A version-aware resolver MAY use a registry, a local model catalog, or another source of candidates. How it discovers candidates or maps a retrieval URI to a target identifier is outside this proposal. It MUST establish the target identity and one authorized source sequence before comparing revisions. It MUST NOT combine candidates across distinct `id` values or independent source sequences, even when documents in those sequences advertise the same identifier.

The provider MUST declare the profile for its candidate set through an established endpoint or catalog contract. A legacy provider supporting only this proposal's SemVer rules MAY omit that declaration; absence means SemVer only under that legacy contract. An unknown or unavailable profile MUST fail version-aware resolution as `unknown-profile`. A processor MUST NOT infer a profile from integer-looking content or switch profiles per document. Profile provisioning and revision allocation are provider responsibilities, not WoT document syntax.

### 4.1 SemVer profile

A TM author MUST use a new `id` for a breaking change, including a change that makes an earlier version's valid use incompatible. All versions published under one TM `id` MUST be backward compatible with earlier versions under that identifier. The major compatibility line belongs in the identifier; an identifier such as `urn:example:pump:v1` distinguishes it from `urn:example:pump:v2`. This proposal does not prescribe an identifier syntax or require a literal `v1` suffix.

A TM's authored SemVer major-version change MUST use a new `id`. Minor and patch changes under one TM `id` MUST preserve backward compatibility. A resolver MUST NOT search a successor identifier to satisfy a floor on the original identifier, even if that successor has a numerically higher version.

For a TD, `id` identifies a concrete Thing and does not carry a compatibility major. A breaking revision therefore retains the TD `id` and advances the major component of `version.instance`.

An authored version used for SemVer comparison MUST satisfy Section 3's syntax. A provider MAY explicitly support generated SemVer bookkeeping revisions for unchanged documents lacking an authored SemVer version. Such revisions are prereleases, not authored compatibility promises, and cannot be floors. They require prerelease opt-in, a raw pin or a sticky default to be selected. A resolver MUST NOT invent a candidate version when the provider supplies neither a valid authored version nor an explicitly supported generated revision. Assignment syntax and storage lineage belong to the provider profile; Section 9 describes xRegistry's mapping.

An authored TM version comes from `version.model`; an authored TD version comes from `version.instance`. Apart from explicitly supported generated bookkeeping revisions, an internal storage label does not supply a SemVer candidate version. A version number is an author's compatibility claim, not evidence of compatibility or document authenticity. Authors SHOULD validate compatibility before publication.

### 4.2 Incremental profile

An incremental revision and floor MUST be canonical positive decimal strings matching `[1-9][0-9]*`. A resolver MUST compare them as integers without rounding or fixed-width overflow; decimal length followed by ordinal comparison is sufficient. The provider's revision, not the document's authored version label, supplies the ordering key.

A publisher can supply unchanged bytes with an absent, integer, SemVer or free-form authored version. The provider MUST preserve those bytes and bind the assigned revision, profile, origin, exact digest and effective compatibility line through trusted metadata. If the bytes declare a root line and authorized publication metadata also declares one, the publisher MUST reject disagreement as `inconsistent-publication`. Each revision fixes its line membership, including absence; changing that declaration requires another revision.

A later revision in one line claims backward compatibility with every earlier revision in that line. A breaking change uses another line; the target's `id` can remain unchanged for either a TM or TD. Neither integer order, lineage nor the line label proves semantic compatibility. Publisher authorization and compatibility validation remain separate obligations.

A revision without a line MAY be stored and retrieved exactly, but MUST NOT participate in automatic line selection. The publishing boundary MUST report that limitation. A provider assigning revisions MUST prevent reuse within the same source sequence, including after deletion or restart; the durable allocation mechanism and upload retry protocol are outside this proposal. Copying to an independent sequence requires an explicit mapping before old numeric floors or pins can be reused.

An offline catalog or cache supplying declarations absent from the bytes MUST retain their trusted association with the exact revision and digest. A digest alone does not authenticate a profile, publisher or line.

## 5. Determining the floor

These rules derive the requirement for live resolution and snapshot composition. They do not run for raw exact replay.

### 5.1 Explicit TM-reference floors

For a SemVer TM reference other than a TD type link, the optional explicit floor applies to the whole target TM, not a particular definition. Compare it to the target's SemVer version without a TD major cap and without leaving the target identifier. For ordinary `tm:ref` and `td:ref`, select or bind the document revision before evaluating its fragment. The processor MUST report a missing definition in that revision, not retry an older one.

A document-local reference uses the containing exact revision instead of selecting another candidate. The processor MUST check that revision against the applicable floor and line. For a SemVer floor, check the containing TM's `version.model` or the containing TD's `version.instance`; for the TD, a missing version or one outside the floor or cap fails as `unsatisfied`, and an invalid version fails as `invalid-version`. For an incremental reference, check the containing revision's trusted line and revision metadata. A failed requirement or missing definition MUST fail reference resolution without substituting another revision.

### 5.2 Exactly one TD type link

The resolver MUST establish the target profiles of the TD's type links before deriving their floors. A type link MUST target a TM; a non-TM target causes an error rather than an unconstrained model match. When exactly one link targets a SemVer TM, the effective floor is the greater of its explicit floor and the TD's `version.model` by SemVer precedence, or the only value present. `version.model` states the version needed by the TD, not an exact revision. Prerelease eligibility uses the effective floor.

The resolver MUST validate any explicit floor under Section 3. When deriving an implicit floor, it MUST validate a present `version.model` against the same SemVer floor rules, without applying a stored revision identifier's length limit. A null value, a non-SemVer string, a version with build metadata, or a generated bookkeeping value fails as `invalid-version`. Only an absent `version.model` means no implicit floor. Apply these checks after the ambiguity check in Section 5.3 when it applies. Raw exact replay does not derive the implicit floor.

### 5.3 Several TD type links

When several type links target SemVer TMs and the TD has a `version.model` member, each SemVer link MUST carry its own explicit floor. When deriving these requirements, the resolver MUST report a missing per-link floor as `ambiguous-floor` before validating the individual floor values, even when resolving a different, fully specified link. It MUST NOT fill in a missing per-link floor from `version.model`. If all required floors are present, validate their values and take the greater of each explicit floor and `version.model` as in Section 5.2.

A TD without `version.model` has no implicit floor. Each SemVer type link MUST use its own explicit floor if present, and otherwise has no floor. A missing floor in this case MUST NOT produce `ambiguous-floor`; TDs with several unversioned SemVer type links can be resolved without adding floors. Each link is resolved independently against its own target TM.

These implicit-floor and ambiguity rules apply only to the SemVer-target subset. With one SemVer link and one incremental link, only the SemVer link receives the implicit model floor. Each incremental link independently requires its own line and OPTIONAL numeric floor under Section 5.5. An unknown target profile MUST fail rather than removing that link from consideration.

If a TD has no `type` links, the resolver has no link to which it can attribute an implicit floor. This proposal does not infer a target from `version.model` alone or change ordinary TD validation for that case.

### 5.4 TD-to-TD floors

A SemVer TD target with a floor MUST be at or above the floor by SemVer precedence and have the same major component as the floor, including when that component is `0`. For example, a `0.4.2` floor admits `0.5.0` but excludes `1.0.0-rc.1` even if prereleases are allowed. A TD reference without a floor has no version bound and MAY resolve across majors. Prerelease eligibility follows Section 6.1.

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

Live selection and snapshot composition for an incremental TM or TD MUST use an explicit compatibility line. A missing line, with or without a floor, MUST fail as `compatibility-required`. Check any numeric floor using Section 4.2; a malformed value MUST fail as `invalid-version`. There is no SemVer major cap or prerelease filter. The referring document's version fields and root line do not supply a requirement.

The outcome names in this proposal describe failures; they do not define a protocol error envelope.

The following abbreviated link uses the deployment mapping from Section 3.1, not proposed core WoT term names:

```json
{
  "rel": "td:extends",
  "href": "urn:example:pump:base",
  "uav:compatibilityLine": "urn:example:pump:control-a",
  "uav:minVersion": "42"
}
```

## 6. Resolution semantics

The caller chooses the operation. An exact replay pin is not an authored requirement, and a publication selector does not turn a bound dependency into a live lookup.

| Request              | How it gets its target                                                                                                                       | What the resolver checks                                                                                                                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live selection       | Establish one authorized source sequence. Use its sticky default if declared; otherwise choose the highest eligible candidate (Section 6.1). | Check target identity and kind, trusted profile, floor, line and prerelease policy as applicable. A sticky SemVer choice bypasses only prerelease filtering. An unacceptable found target or default does not authorize another source or revision as a fallback. |
| Raw exact replay     | Use the caller's exact revision or digest in one authorized source sequence (Section 6.2).                                                   | Verify identity, authority, bytes and any retained expectations. Do not derive or apply authored floors or lines and do not claim authoring validity or compatibility. Failure does not retry live.                                                               |
| Snapshot composition | Open the supplied channel once or verify the exact snapshot and use its captured bindings (Section 2.3).                                     | Verify the bound revision's identity, authority and bytes, and check its applicable authored requirements and caller policy. Do not retry live, use another digest match or substitute another snapshot. A partial set is not successful composition.             |

In any of these operations, conflicting bytes or fixed metadata claiming the
same source revision identity MUST fail as `inconsistent-publication`.

### 6.1 Selection

For standalone live resolution, a resolver MUST apply these steps in order:

1. Establish the target identifier, expected kind, authorized source and candidate sequence. A missing target fails as `not-found`. Validate candidate identity and representation; invalid candidates MUST NOT be treated as eligible.
2. Determine the trusted target profile and derive the applicable requirements under Sections 3–5.
3. If the provider declares an operator-selected sticky default, use that exact revision. Fail if it is unavailable or violates the line, floor or TD major cap. Do not replace it with another revision.
4. Otherwise, for SemVer targets, exclude prereleases unless the effective floor is a prerelease or the consumer explicitly opts in. Apply any floor and TD major cap under Section 5, then select the highest remaining version by SemVer precedence.
5. Otherwise, for incremental targets, restrict candidates to the required line and optional numeric floor, then select the highest integer revision. Generated integer revisions are ordinary candidates, not prereleases.
6. Fail as `unsatisfied` if no eligible revision exists. Complete ordinary reference processing against the selected document, including its fragment and dependencies, or report an error.

A non-sticky raw retrieval default, publication order or retrieval order MUST NOT replace profile-specific selection. A provider that cannot expose the profile or default policy needed for constrained resolution MUST report unsupported resolution rather than treat raw retrieval as a successful match.

A release has higher precedence than prereleases of the same major, minor, and patch values. Numeric prerelease identifiers are compared numerically under SemVer; for example, `1.3.0-rc.10` has higher precedence than `1.3.0-rc.2`. A prerelease such as `1.2.0-rc.1` is below a release floor of `1.2.0`, even when the consumer opts in.

### 6.2 Resolution records and reproducibility

A successful resolution MUST return a record containing the target identifier, selected revision, a cryptographic digest of the selected document's exact bytes, and the source origin/sequence. The record MUST identify the applicable profile and effective line when incremental expectations apply. A consumer requiring reproducibility MUST retain the revision, digest and applicable metadata expectations. The digest algorithm and digest MUST be identified; SHA-256 is RECOMMENDED. The resolver MUST NOT canonicalize or transform the bytes before calculating an exact-bytes digest.

A caller-supplied raw pin is handled before deriving authored requirements or selecting a default. Raw exact replay MUST use the source-scoped revision identifier or exact digest without deriving or applying an authored floor or line, TD major cap, or prerelease policy. It MUST verify source identity, authorization, bytes and any retained metadata expectations; a retained expectation about a revision's line is not a requirement derived from the referring document. Missing pinned content MUST fail without an unpinned fallback. A later operation authoring, validating or composing a document MUST still apply its own checks, including where the retrieved document has malformed or ambiguous references.

A bare digest can match identical bytes in several revisions or lines. Within the selected source sequence the resolver MUST select the highest matching revision under the known profile; the digest pins bytes, not a particular line membership. If the caller uses that revision for an operation that checks compatibility, the operation MUST check the selected revision, not retry a lower digest match. To replay a particular revision, use its exact identifier and verify the retained digest and metadata expectations. A richer stored record does not require an API to accept both selector kinds.

For standalone live resolution, the consumer selects newer candidates through a new unpinned resolution and retains a new record. A publication consumer instead opens the channel again to evaluate its newly selected snapshot. Refresh and deployment activation are separate caller operations. Snapshot-bound composition follows Section 2.3: an exact binding fixes the candidate but does not bypass compatibility acceptance.

The resolver's selected version and digest MUST NOT be written into the authored WoT document as a pin for these references. A resolver MUST NOT replace the floor with the selected version or rewrite the target to a registry-specific revision identifier. Keeping the authored requirement separate from the resolution result allows the document to be used across catalogs and registries.

This separation does not prohibit the distinct, explicitly authored `wotproj:sourceDigest` mechanism in the projection proposal; its interaction is specified in Section 8.2. An exact source-bytes pin does not automatically pin the source's transitive dependencies. Reproducible dependency resolution requires retaining a resolution record for every version-resolved dependency.

### 6.3 Resolution cases

These cases assume SemVer unpinned resolution of one target identifier and no sticky default. A dash in the floor column means the reference omits a floor.

| Available authored versions                         | Floor        | Consumer allows prereleases | Result                                                                  |
| --------------------------------------------------- | ------------ | --------------------------- | ----------------------------------------------------------------------- |
| `1.0.0`, `1.1.0`, `1.0.1`                           | `1.0.0`      | No                          | `1.1.0`, independent of publication order                               |
| `1.1.0`                                             | `1.2.0`      | No                          | Failure: unsatisfied floor                                              |
| `1.2.0`, `1.3.0-rc.1`                               | `1.2.0`      | No                          | `1.2.0`                                                                 |
| `1.2.0`, `1.3.0-rc.1`                               | `1.2.0`      | Yes                         | `1.3.0-rc.1`                                                            |
| `1.3.0-rc.2`, `1.3.0-rc.10`, `1.3.0`                | `1.3.0-rc.1` | No                          | `1.3.0`                                                                 |
| `1.3.0-rc.2`, `1.3.0-rc.10`                         | `1.3.0-rc.1` | No                          | `1.3.0-rc.10`                                                           |
| `1.2.0-rc.1`                                        | `1.2.0`      | Yes                         | Failure: prerelease is below the floor                                  |
| `1.3.0-rc.1`                                        | —            | No                          | Failure: no eligible release                                            |
| `1.2.0`, `1.3.0`                                    | —            | No                          | `1.3.0`                                                                 |
| TD target: `1.4.0`, `1.7.0`, `2.0.0`                | `1.4.0`      | No                          | `1.7.0`                                                                 |
| TD target: `1.4.0`, `2.0.0`                         | `1.4.0`      | No                          | `1.4.0`                                                                 |
| TD target: `1.2.0`, `2.0.0`                         | —            | No                          | `2.0.0`                                                                 |
| TD target: `1.2.0-rc.1`, `1.3.0-rc.1`, `2.0.0-rc.1` | `1.2.0-rc.1` | No                          | `1.3.0-rc.1`                                                            |
| TD target: `0.5.0-rc.1`, `1.0.0-rc.1`               | `0.4.2`      | Yes                         | `0.5.0-rc.1`; the next major is excluded even for a floor of major zero |

A TD with two SemVer type targets and `version.model` fails with `ambiguous-floor` if one link omits its explicit floor, even if the other supplies a malformed floor. With one SemVer target and one incremental target, the SemVer link can use `version.model` without an explicit floor, but the incremental link must have its own line. Without `version.model`, each SemVer link uses only its explicit floor, if present.

For the pump type link in Section 5.4, the floor is `2.3.0`. If the authorized sequence for that TM identifier has `2.2.0`, `2.3.0` and `2.4.0`, live selection without a sticky default chooses `2.4.0`. Raw replay can retrieve a retained pin to `2.2.0` without applying the floor. A snapshot bound to `2.2.0` instead fails composition, while one bound to `2.3.0` can satisfy the link without looking up `2.4.0`. A breaking `3.0.0` TM uses a different identifier; it is not an alternate candidate.

The following cases contrast live selection, raw replay and publication acceptance. A and B abbreviate distinct absolute incremental line URIs in one source sequence.

| Operation and candidates                            | Requirement                 | Result                                                                      |
| --------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| Live: `42/A`, `43/B`, `44/A`                        | Line A, no floor            | `44/A`                                                                      |
| Live: same history                                  | Line A, floor `45`          | `unsatisfied`                                                               |
| Live: same history                                  | Floor `42`, no line         | `compatibility-required`                                                    |
| Live: same history, sticky `43/B`                   | Line A                      | `unsatisfied`; do not select `44/A`                                         |
| Live SemVer: `1.4.0`, `1.7.0`, sticky `2.0.0`       | TD floor `1.4.0`            | `unsatisfied`; do not select `1.7.0`                                        |
| Raw replay: revision `42/A` retained                | Current authored floor `44` | Retrieve `42/A`; verify retained expectations                               |
| Raw replay: an exact revision with no recorded line | No authored line            | Retrieve the revision if identity, authorization and bytes check out        |
| Bare digest: identical bytes at `42/A` and `44/B`   | Digest only                 | `44/B`; no line-membership guarantee                                        |
| Snapshot binds an incremental target                | No authored line            | `compatibility-required`; exact binding does not waive the line requirement |
| Snapshot binds dependency to `43/B`                 | Source requires A           | Reject composition; no live or older-snapshot fallback                      |

## 7. Version-navigation links

A TD or TM MAY include links with `rel: "successor-version"` or `rel: "latest-version"` using the registered relations defined in [RFC 5829](https://www.rfc-editor.org/rfc/rfc5829.html). TD 1.1 also supports `predecessor-version`. A consumer can follow these relations to navigate a version history; they do not constrain versions or determine candidate selection.

A deprecated SemVer TM's successor link MAY identify its replacement under a new major-version identifier. An incremental TM can instead change compatibility lines under the same identifier. A latest-version link MAY locate the latest version in the corresponding version history. Neither link establishes that its target is compatible, has the original identifier, or satisfies a requirement. A resolver MUST NOT use navigation links to redirect an existing reference across compatibility lines or to override the selection rules in Section 6.

Deprecation does not itself make compatible versions ineligible. The [deprecated v1 example](./examples/tm-deprecated-v1.jsonld) states deprecation in its description and links to v2; this proposal introduces no new deprecation member or automatic migration rule.

## 8. Relationship to other proposals

### 8.1 TD Composition and Reuse

[TD Composition and Reuse](../td-composition/spec.md) Sections 5–7 define `td:extends`, `td:subthing`, and `td:ref` and their composition behavior. The [authoring](#3-vocabulary-and-json-ld-context) and [resolution](#6-resolution-semantics) rules here determine which revision is supplied to those operators, not what the operators do.

Ordinary TM composition uses `tm:extends`, `tm:submodel`, and `tm:ref` with version selection performed before the existing operator's processing. Version selection does not change inheritance, child-model semantics, overrides, context preservation, source ownership, security, or cycle handling. A version floor cannot make an otherwise invalid composition valid. When a composed TD includes type links to TMs, the type-link rules apply to those model references independently of TD-to-TD composition.

### 8.2 WoT Projection Plans

[WoT Projection Plans](../wot-projections/spec.md#4-source-manifest) defines verification of `wotproj:sourceDigest`, including pins on unused sources.

A projection source-manifest entry follows the requirements in Section 3 and the [source manifest rules](../wot-projections/spec.md#4-source-manifest). The entry's expected media type determines its target kind; the provider contract determines its profile. The projection envelope's `version.model`, `version.instance` and root line do not supply source requirements.

These requirements apply to manifest-source resolution, not to selector annotations. Projection selectors use `tm:ref` in both TD and TM envelopes and retain their projection-specific meaning; they do not acquire ordinary `tm:ref` floor semantics merely by sharing that member name. The projection proposal's closed selector-annotation set admits neither floors nor line selectors. Authors MUST NOT use selector-local requirements to select a different revision of a manifest source.

An ordinary `tm:ref` that is not a projection selector can carry `tm:minVersion` as specified in Section 5.1. Ordinary TM references inside a retrieved source likewise retain their floors during dependency resolution. A source's TD type-link floors are evaluated against that source's own root metadata, not against the projection envelope's `version.model`.

A source digest does not pin transitive dependencies. The consumer MUST separately retain dependency resolution records or use source pins at the relevant dependency boundaries when reproducibility is required.

An authored `wotproj:sourceDigest` is not a request for raw exact replay. Projection processing MUST check both the source's applicable compatibility requirement and any declared digest against the selected revision. If source selection uses the digest outside a snapshot, apply the digest match rule in Section 6.2 and check that revision. Within a snapshot, use the exact bound revision instead, even if another revision has the same digest. Reject either unmet check without fallback. Where neither rule specifies priority, this proposal does not prescribe which failure to report when the same bound source fails both checks. Publication closure covers reachable source dependencies; the projection proposal's acyclic-plan rule is unchanged.

<a id="94-xregistry-mapping-informative"></a>

## 9. xRegistry mapping (informative)

The [WoT Registry Service draft, Version 1.0-rc4][xRegistry WoT], specifies the SemVer and Incremental profiles, the three resolution operations, and [the WoT closure rules][xRegistry WoT publication] for xRegistry. These clauses are under review in [xregistry/spec#571] and do not establish runtime support. The [xRegistry Publications working draft][xRegistry publication] defines the underlying manifest, channel, and open context. These references describe the registry mapping; they do not define WoT conformance.

In the SemVer mapping, TM `version.model` and TD `version.instance` supply `versionid` when valid; missing or non-SemVer values receive `0.0.0-N` with the lowest unused positive N. The provider records `versionorigin` without rewriting document bytes. Build metadata and Core identifier-limit violations fail publication. The proposed incremental mapping uses a durable high-water mark. A canonical authored integer supplies the revision only above that mark; an older integer fails new publication. An absent or non-integer authored value instead receives the next integer. Both maps preserve source identity, but independent integer sequences are not interchangeable. These assignment algorithms, Core lineage aspects and identifier limits are not W3C WoT requirements.

The Resource and provider sequence scope selection. A replay request can name an exact Version or supply a digest, but not both; a retained result can record both. An authored projection source digest checks the bytes of the selected Version in xRegistry. It does not choose the Version. A Resource's default Version does not select a publication, and a document digest does not identify a manifest.

An individual binding may impose additional authoring restrictions on documents written for that binding. Those restrictions do not narrow the portable reference table or the general type-link rules in this proposal.

xRegistry's generic publication model identifies a snapshot by the SHA-256 of exact manifest bytes. Its channel head is a checked manifest descriptor updated conditionally with the channel Meta epoch; rollback advances that epoch, and deleted channel Resource identities cannot be reused. Groups are organizational containers, not channels, snapshots or compatibility lines. A WoT closure extension binds source Version/reference locations to exact target Versions; this draft does not copy its XIDs or extension format into WoT vocabulary.

The [xRegistry Federation working draft][xRegistry federation] separates source ownership, original reference bases, and capture completeness. The [Publication HTTP projection][xRegistry publication HTTP] exposes a snapshot-specific root and a checked open record. Git commits, OCI digests, and publication IDs remain distinct; an alternate binding needs a checked association to the captured model, metadata, and bytes before it can serve the same publication. Read-only federation does not provide publication writes.

The checked SemVer vectors establish only their documented baseline cases. Generic publication examples exercise synthetic state and integrity; the WoT closure sample/schema checks shape, not independent closure discovery, compatibility enforcement, durable allocation or deployed cross-binding conformance.

## 10. Security considerations

A floor is not an authenticity or authorization guarantee. Resolvers SHOULD authenticate candidate publishers or apply an appropriate trust policy and SHOULD use authenticated transport. A digest detects byte changes relative to a retained trusted pin; an untrusted digest does not establish provenance.

Resolvers SHOULD enforce safe-fetching policies covering URI schemes, destinations, redirects, response size, recursion depth, retrieval time, and dependency cycles. They MUST NOT copy retrieval credentials into imported interaction security or weaken the source's security during composition. Resolver origin is provenance metadata, not authority to change a document's identity or compatibility contract.

## 11. Examples and adoption work

The [example guide](./examples/README.md) lists illustrative JSON-LD documents for SemVer floors and versions, incremental requirements, and model navigation. Example target IRIs identify externally supplied documents; the examples are not a candidate repository or an executable resolution service.

This proposal does not modify the base TD/TM context or schemas in this repository. Section 1 sets a claim-based conformance boundary; this proposal defines no protocol for discovering whether a processor makes that claim.

The SemVer floor terms remain provisional. Incremental requirements use the OPC UA deployment mapping in Section 3.1; this proposal defines no core WoT terms for them. W3C adoption requires a separate decision and corresponding vocabulary, context, schema and validation changes.

Live selection depends on a provider contract that exposes trusted profile, sequence and sticky-default metadata. Snapshot-bound composition uses the exact bindings and fixed metadata in the selected snapshot. This proposal defines neither a provider-discovery mechanism nor a publication API or manifest format. Independent implementation evidence is still required for compatibility checks, closure discovery, snapshot acceptance and offline replay; examples and schema checks do not establish those behaviors.

[xregistry/spec#571]: https://github.com/xregistry/spec/pull/571
[xRegistry WoT]: https://github.com/marcschier/xregistry-drafts/blob/main/workingdrafts/models/wot/spec.md#54-versioned-reference-resolution
[xRegistry WoT publication]: https://github.com/marcschier/xregistry-drafts/blob/main/workingdrafts/models/wot/spec.md#544-publication-closure
[xRegistry publication]: https://github.com/marcschier/xregistry-drafts/blob/main/workingdrafts/publication/spec.md#publishing-and-opening-a-channel
[xRegistry publication HTTP]: https://github.com/marcschier/xregistry-drafts/blob/main/workingdrafts/publication/spec.md#http-projection
[xRegistry federation]: https://github.com/marcschier/xregistry-drafts/blob/main/workingdrafts/federation/spec.md
