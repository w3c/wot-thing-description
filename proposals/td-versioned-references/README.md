# WoT Publications and Versioned References

> [!NOTE]
> Proposal Status: In Progress

Publish related WoT documents as a complete immutable snapshot and expose that snapshot through a named channel. A consumer opens the channel once, then interprets entries and dependencies using the snapshot's exact bindings. The companion [specification draft](./spec.md) defines the WoT closure and compatibility contract for that flow without prescribing a registry, publication API or manifest format. The vocabulary and processing rules are proposals, not a W3C Recommendation.

## Summary

A publisher creates or reuses document revisions, binds each recognized dependency occurrence to an exact target, validates the complete set and retains it as a snapshot before conditionally moving a channel head. A consumer selects that publication, not an independently moving revision for every reference. Forking can share a snapshot, promotion can select an already reviewed set, and rollback can restore an earlier set without renumbering documents.

The snapshot determines what the consumer evaluates. SemVer floors and incremental compatibility lines determine whether its bound dependencies are acceptable. A channel named `stable` does not replace those checks, and a failed check does not authorize live selection or an older-snapshot search.

## Motivation

Resolving each dependency independently against a live catalog can produce a combination the publisher never validated. Retaining an entry document alone does not fix its transitive dependencies, and reopening a channel during the same operation can mix two publication states. A publication therefore needs exact bindings for every recognized external reference occurrence, together with original bases, contexts and trusted metadata.

Document revisioning remains independent of set publication. A changed document receives a revision; unchanged revisions can appear in several snapshots. SemVer supports authored compatibility versions. Incremental providers can instead assign integer revisions to unchanged external bytes and retain authorized compatibility-line declarations alongside them. Neither scheme turns a document revision into the identity of the complete publication.

## Goals

- Define a publication-first flow with one selected snapshot, complete occurrence bindings and explicit compatibility acceptance.
- Preserve publication context during reads, refresh, promotion, rollback and offline replay without live fallback.
- Keep publication protocols and registry storage outside WoT language requirements.
- Define optional `tm:minVersion` on TM references and TD `rel:type` links, and `td:minVersion` on TD-to-TD composition references.
- Preserve implicit and explicit SemVer type-link floors, applying them only to the SemVer-target subset of mixed-profile links.
- Define incremental line selection and optional numeric floors without inventing core WoT term names.
- Distinguish standalone live resolution, including sticky defaults, from snapshot consumption and raw exact replay.
- Keep authored version requirements portable and exact resolution records under consumer control.
- Define optional version-navigation links without using them for resolution.

## Non-goals

- Defining version ranges, document-embedded resolver pins, or registry-specific identifiers.
- Defining floors for other TD links or changing TD-to-TD composition semantics.
- Defining a discovery protocol, registry allocation/storage model, publication API or manifest format, compatibility checker, or automatic migration across breaking changes.
- Changing how projections select definitions, preserve source ownership, or verify digests.

## Design

### Publish, open and consume

The [publication model](./spec.md#2-publication-model) is the primary workflow:

1. Prepare changed document revisions and reuse unchanged ones.
2. Resolve and validate the complete dependency closure, recording exact targets for each recognized reference occurrence.
3. Retain the immutable snapshot and required content, then conditionally advance the channel.
4. Open the channel once and keep that selected context for the consumer's whole operation.
5. Validate each bound target's compatibility and apply the existing WoT composition or projection rules.

For example, `preview` points to S12, where an entry's dependency is bound to revision 42/A. The publisher prepares S13 with that dependency bound to 44/A, validates it, then conditionally moves `preview`. Existing S12 readers continue using 42/A; a new open selects S13. The consumer never substitutes a newer live line-A revision for either binding.

A reviewed S13 can be promoted by conditionally pointing `stable` at it, without creating another snapshot or document revision. Rollback restores S12 as a new conditional head update; readers already using S13 stay there. If a new head instead binds a dependency to 43/B while the entry requires A, composition fails. Channel movement does not redefine the authored requirement.

### Publication context and offline replay

Every dependency and page read uses the selected snapshot. Missing or incompatible content fails without live resolution, reopening the channel or searching earlier heads. Refresh explicitly opens a new context for review; deployment activation remains the caller's operation.

Offline replay needs the retained snapshot description, exact bytes, fixed metadata, original bases and immutable context material. A document cache alone does not establish WoT closure. This contract does not add a WoT manifest serialization or channel member to authored references; a publication mechanism supplies the context separately.

### Reference requirements within a publication

The channel selects the publication, and its bindings select exact dependency revisions. The following profile-specific requirements constrain acceptance of those revisions. They also guide a publisher preparing bindings or a standalone resolver selecting live candidates. The provider declares each target's profile; a consumer never guesses it from document content.

#### SemVer references

`tm:minVersion` sets a minimum for the target TM's `version.model`. `td:minVersion` sets a minimum for the target TD's `version.instance` and caps acceptable revisions below the next major, including when that major is zero. Both values use SemVer 2.0.0 without build metadata. An unfloored TD reference has no major cap, but still uses its snapshot's exact binding. A referencing TD's versions do not determine the target TD version.

For a TD with exactly one SemVer `type` target, the effective floor is the greater of the link's explicit floor and the TD's implicit `version.model`, or the only floor present. With several SemVer targets and `version.model`, each SemVer link requires an explicit floor; a missing one produces `ambiguous-floor`. Without `version.model`, those per-link floors are optional. Incremental type targets never inherit a model floor.

Snapshot acceptance checks prerelease eligibility: the effective floor must be a prerelease or the consumer must opt in to accept a prerelease target. In standalone live selection, a sticky default bypasses prerelease filtering but must satisfy the floor and TD cap; it does not override a snapshot's binding. Generated `0.0.0-N` bookkeeping identifiers are not incremental revisions and cannot be floors.

#### Incremental references

An incremental reference requires an absolute compatibility-line URI and can add a canonical positive decimal floor. A bound 42/A satisfies line A with floor 42 even if live revision 44/A now exists; a bound 43/B does not. A floor without a line fails. Independent providers' revision numbers are not interchangeable.

The [deployment mapping](./spec.md#31-incremental-requirements-and-deployment-mapping) illustrates xRegistry's proposed `uav:minVersion` and `uav:compatibilityLine` terms in the existing OPC UA WoT Binding namespace. It changes no composition operator. Core WoT names remain open rather than treating that external vocabulary as adopted W3C language.

### Standalone live resolution and raw exact replay

Outside snapshot-bound consumption, [standalone live resolution](./spec.md#61-selection) selects the highest qualifying revision unless a sticky default is authoritative. With incremental history 42/A, 43/B and 44/A, a line-A request selects 44; a sticky 43/B makes it fail. This live algorithm is not a fallback for a snapshot's missing or incompatible bound target.

A consumer can also retain an exact revision, digest, origin and applicable profile/line expectations outside the document. Raw exact replay retrieves that selection without rerunning live candidate selection and verifies the recorded expectations. It does not imply compatibility-checked composition or pin the transitive closure.

## Examples

The [example guide](./examples/README.md) starts with publication, consumption, promotion and rollback, then shows the reference requirements in JSON-LD:

- [TM extension with a floor](./examples/tm-extends.jsonld).
- [TM submodel with a floor](./examples/tm-submodel.jsonld).
- [TM definition reference with a floor](./examples/tm-ref.jsonld).
- [TD with one implicit type floor](./examples/td-single-type.jsonld).
- [TD with two explicit type floors](./examples/td-multiple-types.jsonld).
- [Deprecated major-version model with navigation links](./examples/tm-deprecated-v1.jsonld).
- [TD composition floors and TD instance versions](./examples/td-extends.jsonld), [td-subthing.jsonld](./examples/td-subthing.jsonld), [td-ref.jsonld](./examples/td-ref.jsonld), [td-instance-v1.jsonld](./examples/td-instance-v1.jsonld), and [td-instance-v2.jsonld](./examples/td-instance-v2.jsonld).
- [Incremental TD composition](./examples/td-incremental-extends.jsonld) and [incremental TM definition reference](./examples/tm-incremental-ref.jsonld), using the informative deployment mapping.

## Relationship to other proposals

[TD Composition and Reuse](../td-composition/spec.md) defines TD-to-TD operators. This proposal defines how their target TD version is selected; selection does not change composition semantics.

[WoT Projection Plans](../wot-projections/spec.md) defines `wotproj:sourceDigest`, which pins the exact bytes of a source. That authored pin serves a different purpose from a version floor or a consumer-owned resolution record. [Section 8 of the draft](./spec.md#8-relationship-to-other-proposals) specifies how these constraints interact, including when a source contains a nested plan or dependencies.

The [source mapping](./spec.md#9-xregistry-mapping-informative) records the reviewed head of [xregistry/spec#571](https://github.com/xregistry/spec/pull/571), distinguishes its SemVer specification from the proposed incremental and closure designs, and links the generic publication and federation contracts. xRegistry-specific epochs, XIDs, manifest formats and revision allocation remain outside WoT language requirements.

## Next steps

- Review publication-context handling, closure, compatibility acceptance and failure behavior with TD/TM implementers.
- Settle the core incremental vocabulary and integrate the proposed terms into contexts, validation schemas, and conformance tests before normative adoption.
- Exercise shared resolution cases across independent resolvers, including prereleases, missing floors, and digest failures.
