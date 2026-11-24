# Use cases for WoT Projection Plans

Use a projection plan when an application needs a purpose-specific interface
drawn from existing Thing Descriptions (TDs) or Thing Models (TMs). The
[draft proposal](./spec.md) describes how to turn a plan into an ordinary TD or
TM without modifying the sources. The plan's root kind determines the result
kind. A TD result still needs valid interaction forms.

## Build a monitoring view from several Things

A cold-storage dashboard needs the current temperature from a room controller,
the door state from a sensor, and an event from an alarm service. The source TDs
describe more than the dashboard needs and are maintained by different teams.

The plan lists the three TDs in its [source manifest](./spec.md#4-source-manifest).
It uses [explicit selections](./spec.md#51-explicit-selection-and-annotations)
to name the affordances `roomTemperature`, `doorOpen`, and `temperatureAlarm`
in the view. It can add a display title to `roomTemperature` without changing
the source schema. A complete local `viewStatus` property reports whether the
dashboard service is running. The resolved TD retains provenance for the
imported affordances. By default, each imported interaction keeps the source's
forms and effective security. The plan doesn't grant access to the sources.

## Select a repeatable set of diagnostic affordances

A device integration team builds a diagnostic TM from two vendor TMs. It wants
every affordance from a small power-monitor model and only the diagnostic
properties from a broader controller model.

The plan uses [whole-source selection](./spec.md#52-whole-source-selection)
with a `power` name prefix for the first source. It uses a
[predicate](./spec.md#53-predicate-selection) for the second source that
matches properties with an agreed JSON-LD class. The predicate matches the
expanded class IRI exactly. It doesn't infer subclasses or match names.
If imports still collide within the same affordance category, the
[priority rules](./spec.md#6-deterministic-conflict-resolution) determine
which selection stays. A complete local definition with the same name and
category takes precedence over an import.

## Serve the view from a gateway

A gateway exposes selected device affordances through its own endpoint, rather
than asking application clients to connect to each device. The device TDs
still describe the source definitions.

For imports served by the gateway, the plan uses
[projection routing](./spec.md#8-routing-and-security). Explicit selections
provide gateway forms and security; for bulk or predicate selections, the
gateway supplies them during resolution. An imported definition retains its
schema and provenance. The gateway needs an actual route to serve the
interaction. Reusing a source form with gateway credentials isn't a route.

## Rebuild a reviewed view

A team publishes a dashboard view with a set of reviewed source revisions.
It needs a later build to use the same dependencies even if a device
description changes.

The consumer opens one [publication snapshot](../td-versioned-references/use-cases.md)
and uses its captured source bindings. The processor also checks any
declared source byte digest, including one on an entry that contributes no
affordances. A digest on a nested plan identifies that plan's bytes, not its
resolved view or its dependencies. If a necessary binding is missing or a
source check fails, the processor doesn't return a partial TD or substitute
a newer live source.

## Annex A: OPC UA use cases (informative)

OPC Unified Architecture (OPC UA) servers represent equipment and data as
nodes. An OPC UA View organizes existing nodes for browsing. The
[draft OPC UA WoT companion specifications][OPC review] describe how a
resolved projection can be exposed in that environment.

- **Browse a maintenance view of a pump.** The maintenance view selects the
  pump speed from an existing Pump TD. A server implementing the draft
  mapping can organize the existing speed Variable in a View. The Variable
  is the node that exposes the speed value. The View doesn't duplicate the
  Variable or create another connection to the pump.
- **Organize views across a production line.** A line-level projection can
  include a maintenance view that the server already exposes. The draft
  mapping uses an organizing node that points to the existing View, rather
  than creating a second View for the same source. The portable proposal
  describes how to resolve the nested plan, not how to organize OPC UA nodes.

[OPC review]: https://github.com/OPCF-Members/OPC10100-WoT/pull/56
