# Use cases for WoT Publications and Versioned References

Use a version requirement to say which revisions a reference accepts. Use an
exact pin to retrieve a particular revision or verify its bytes. Use a
publication to distribute a collection of documents with its dependencies
already bound. The [draft proposal](./spec.md) defines these behaviors without
requiring a particular registry or publication format.

## Follow compatible revisions of a model

A Thing Description (TD) for a building controller needs a ventilation Thing
Model (TM) at version `2.3.0` or later. A live catalog offers `2.2.0`, `2.3.0`,
and `2.4.0` under one model identifier.

The TD's type link has a [minimum version](./spec.md#5-determining-the-floor)
of `2.3.0`. In live selection without a sticky default, the resolver selects
`2.4.0` from the authorized source. A sticky default is a revision that the
provider has explicitly selected. If the provider makes `2.2.0` sticky,
resolution fails instead of moving on to `2.4.0`. A breaking `3.0.0` TM uses
a different identifier and isn't a candidate for the original reference.

## Reuse a definition without crossing a TD major version

A control panel reuses a status property from a deployed controller TD. The
panel understands the property's data from `0.4.2` onward within major `0`.
The same Thing also has a `1.0.0-rc.1` description that changes the property.

The author sets a [`td:minVersion` floor](./spec.md#54-td-to-td-floors) of
`0.4.2` for the controller TD. The resolver can select `0.5.0` but won't
select `1.0.0-rc.1`, even when the caller allows prereleases. The resolver
then evaluates the pointer in the selected document. A local `td:ref`
checks only the containing revision, so an incompatible local target
doesn't start a search for another version of that TD.

## Select an incrementally numbered document

A facilities catalog republishes device descriptions from suppliers that
don't use Semantic Versioning (SemVer). It retains their original bytes and
assigns increasing integer revisions within each source sequence.

A consumer needs a revision from the compatibility line `control-a`: a
provider-declared series of backward-compatible revisions. The catalog has
revision `42` in `control-a`, `43` in `control-b`, and `44` in `control-a`.
With a floor of `42` in `control-a` and no sticky default, live selection
returns `44`. Revision `43` doesn't qualify despite its higher number than
`42`. The [Incremental profile](./spec.md#42-incremental-profile) relies on the
authorized catalog's line and revision metadata, not on the document's own
version label. This proposal doesn't assign portable JSON-LD terms for the
line or numeric floor.

## Promote and roll back a reviewed set

A publisher reviews a dashboard TD, its model, and the TDs it references as
one release. Resolving each dependency independently against a live catalog
could produce a combination the publisher never reviewed.

The publisher records an exact binding for each recognized external reference
and retains the document bytes, fixed metadata, original bases, and contexts as one
[snapshot](./spec.md#2-publication-model). It updates the `preview` channel
only if its head hasn't changed since the publisher read it. After review,
the publisher points `stable` at the same snapshot. A consumer that already
opened `stable` keeps its previous selection for the current operation.
Rollback points the channel at a retained snapshot without rewriting any
document revisions. A missing binding or incompatible target causes
composition to fail rather than mixing reviewed and live content.

## Retrieve the bytes used in a past run

A developer investigating a regression needs to inspect a retained TM
revision from an earlier run. The current TD now requires a higher revision.

[Raw exact replay](./spec.md#62-resolution-records-and-reproducibility) can
retrieve the old revision from its authorized source and verify the retained
digest. A digest alone identifies bytes, which multiple revisions may share.
Replay doesn't apply the current TD's floor or establish that a current
composition is valid. Composing a snapshot bound to that same old revision
still requires the bound target to satisfy the reference. Replaying a whole
release offline also needs its retained closure, not just the entry document
or the model's digest.

## Annex A: OPC UA use cases (informative)

An OPC Unified Architecture (OPC UA) server can use the
[draft WoT registry and binding specifications][OPC review] to stage
descriptions and prepare the assets it exposes to clients. The serving
state is separate from the stored document revisions.

- **Update a pump's model without editing its TD.** An operator selects a
  new compatible revision of the Pump TM. The server resolves and checks
  the pump and its dependencies as a set before it changes what clients
  see. If the replacement fails, the previous pump and model continue
  serving. The failed resolution attempt isn't the committed dependency
  snapshot.
- **Import a reviewed release or replay one revision.** An operator can
  supply a publication context to use the captured dependencies during
  composition. If a captured source can't be verified or doesn't satisfy
  the authored requirement, the server doesn't substitute a live revision.
  An exact read for troubleshooting can retrieve a retained document
  revision, but doesn't activate it or replace the compatibility checks.

[OPC review]: https://github.com/OPCF-Members/OPC10100-WoT/pull/56
