# WoT Projection Plans

> [!NOTE]
> Proposal Status: In Progress

The companion [specification draft](./spec.md) develops this design into a provisional
processing model.

The draft now defines a repository-controlled
[experimental vocabulary and context](./spec.md#12-experimental-vocabulary).
It is not a W3C or OPC Foundation vocabulary assignment. Earlier example
namespace IRIs are not aliases for the experiment.

## Summary

A projection plan is an ordinary WoT Thing Description (TD) or Thing Model (TM) envelope
marked to indicate that it is not yet a complete TD or TM. The plan lists source documents
and represents selected affordances as references into those sources. A projection-aware
processor resolves the plan to an ordinary TD or TM by combining imported affordances with
any complete affordance definitions authored locally in the envelope.

The ordinary root kind determines the result kind. The plan uses standard TD/TM media types;
there is no separate projection document kind or media type. Once resolved, the result no
longer carries the projection marker, source manifest, or unresolved selectors and can be
consumed by existing WoT implementations. Its identifier and scenario-purpose metadata
remain.

## Motivation

TDs describe Things and TMs describe reusable models, but applications often need a
task-specific view that selects affordances from multiple documents. Hand-maintaining a
separate TD or TM duplicates source definitions and can drift as those sources change.

A projection plan describes the selection and the view-specific annotations without copying
source definitions into the plan. It can also include local affordances where the view needs
to define behavior not supplied by a source. Resolution gives WoT processors one complete,
ordinary TD or TM to validate and use.

## Goals

- Reuse the existing TD/TM envelope and affordance maps to describe a projection plan.
- Select affordances from one or more TDs/TMs by explicit reference, whole-source selection,
  or a small closed set of deterministic predicates.
- Combine imported selections with complete local affordance definitions.
- Define deterministic resolution, including collision precedence, annotations, source
  ownership, dependencies, references, context, and security handling.
- Preserve provenance for imported definitions and keep the source documents unchanged.
- Keep the capability generic to WoT, independent of any protocol binding or platform-specific
  materialization.

## Non-goals

- Defining a separate document format, stored document kind, registry format, or
  projection-specific media type.
- Replacing or relaxing the existing semantics of `tm:extends`, `tm:submodel`, or ordinary
  `tm:ref` references, or the separate proposed TD composition terms.
- Defining runtime synchronization, notifications, or source update propagation.
- Defining materialization into a platform-specific information model.
- Granting or transferring credentials or access rights between the plan and its sources.

## Design

### Marked TD/TM envelope

A plan is a normal TD or TM envelope whose root `@type` includes a projection marker. The
ordinary root kind (`Thing` or `tm:ThingModel`) determines the kind of the resolved result;
there is no separate projection-kind field. The plan uses the existing TD or TM media type.
The marker means the envelope is unresolved, not that it is an executable TD/TM.

Ordinary TD/TM admission rejects an unresolved projection marker. A projection-aware
processor validates the envelope, checks local affordances as ordinary definitions, resolves
the imported selections and dependencies, removes plan-only metadata, then validates the
completed ordinary TD/TM. An unresolved selector is a reference plus permitted annotations;
it is not itself an executable affordance definition.

### Sources and selection

When consuming a plan through a publication channel, the processor opens one snapshot
and uses its exact bindings for the plan's source-manifest occurrences and transitive
dependencies. It checks each bound source against the plan's requirement and any
authored digest before selecting affordances. It does not choose newer live revisions
to fill gaps or replace incompatible bindings. The
[publication model](../td-versioned-references/spec.md#2-publication-model)
defines that context; standalone live source resolution remains a separate path.

An ordered source manifest gives each source a unique local name, URI, and expected TD/TM
media type. A source entry can set a SemVer floor
(`td:minVersion` for TDs, `tm:minVersion` for TMs), or select an incremental
compatibility line with an optional numeric floor under the
[versioned-reference contract](../td-versioned-references/spec.md).
The provider declares the profile; the plan's own versions and root line
do not supply source requirements. A source entry can also state how interactions
are routed, pin the source bytes, select all affordances, apply a name prefix
to bulk selections, or provide a bounded predicate.

Explicit selectors use the existing `tm:ref` in both TD and TM envelopes. The projection-plan
format reuses this Thing Model term; using it in a TD envelope does not waive the TD forms
requirement, which resolution satisfies. The
[TD Composition and Reuse proposal](../td-composition/README.md) defines the proposed
ordinary TD reference mechanism alongside `td:extends` and `td:subthing`; its `td:ref` is not
a projection selector, and its terms are provisional. Projection selection across TD/TM
sources remains a projection-specific feature, not permission for cross-kind ordinary
composition.

An affordance-map member is an imported selection only when its reference identifies a
manifest source and points to an affordance in the corresponding map in that source. Such a
selector's map key is the name of the affordance in the view. An affordance-map member that
uses another valid form of reference retains the semantics of its own vocabulary. A member
without a projection-selection reference is a local definition, validated according to the
normal rules for the envelope.

Selection may be explicit, whole-source, or predicate-based. Predicates are limited to
affordance kinds and exact expanded `@type` membership; they do not execute arbitrary
expressions or infer subclasses. The source manifest order and specified selection ordering
make the result deterministic. Explicit selections precede bulk selections within a source. When
multiple imported selections still collide, a defined stable order decides which selection
is retained; a local definition then replaces an imported selection with the same view name.
Processors should report displaced selections.

### Resolution and ownership

Resolution copies selected definitions and their required document-local dependencies from
their sources; it does not copy or modify a source document wholesale. A selector's
reference member is consumed, while references on the source definition are retained and
relocated to their resolved targets. Imported definitions retain source provenance. Local
definitions remain owned by the plan and receive no synthetic provenance.

Permitted annotations can describe an imported affordance without redefining its schema.
The plan may contribute titles, descriptions, additional `@type` values, context-bound
vendor-defined annotations, and—when routing interactions to the plan's endpoint—forms and
security. An annotation `@type` adds RDF class membership; it does not identify the view's
purpose, which `wotproj:scenario` states. Under source routing, forms and
security remain source-owned and cannot be restated on a selection. A source form must not
inherit the plan's credentials; each carried form retains its effective source security.

Resolution preserves source contexts and the original base URI used to interpret location
references. Carried source forms are resolved against the source endpoint; plan-owned forms
are resolved against the plan endpoint. Security definitions are qualified by their source
or plan ownership so definitions with identical local names remain distinct. Missing,
cyclic, or contradictory security references fail resolution.

A source may itself be a projection plan. It is resolved before its selected affordances are
used; the projection dependency graph must be acyclic. Optional source digests can pin a
source to exact retrieved bytes, but do not pin nested-plan results or transitive
dependencies. A publication snapshot retains those dependency bindings separately;
it does not change the projection's affordance selection or collision rules.

### Fit with WoT specifications

This is a core TD/TM composition and processing capability: it changes how a marked TD/TM
envelope is admitted and resolved, not how a protocol is described. The WoT Thing Description
specification is the appropriate home for the generic envelope and resolution semantics.

The [WoT Binding Templates repository](https://github.com/w3c/wot-binding-templates) focuses
on protocol-specific binding descriptions and vocabularies. It is therefore not the better
home for the generic mechanism. Binding Templates may later include examples or profiles
that use projection plans for particular protocols.

## Open questions

1. What namespace and terms should a future standard adopt, and how should
   implementations migrate from the explicitly experimental vocabulary?
2. Which URI schemes and safe-fetching constraints should projection-aware processors
   support?
3. What are the complete rules for copying known dependencies while preserving scoped
   contexts and opaque extension data?
4. Should the initial specification standardize projection-routed forms, or defer that
   routing option?
5. What validation, conformance, and implementation evidence should be required before the
   feature is adopted into the TD/TM Recommendation?

## Next steps

- Run the offline context checks with
  `node --test proposals/wot-projections/tests/experimental-vocabulary.test.js`
  after installing this repository's existing dependencies. These checks cover
  JSON-LD expansion and source-list order, not complete projection resolution.
- Review the marked-envelope processing model with TD and TM implementers.
- Specify and test explicit, bulk, and predicate selection, deterministic conflict handling,
  local-definition precedence, dependency closure, routing, contexts, and security.
- Validate the model with both TD and TM examples, including nested plans and failures.
- Keep platform-specific materialization and protocol-specific examples outside the generic
  mechanism; consider the latter for Binding Templates once the core design is stable.
