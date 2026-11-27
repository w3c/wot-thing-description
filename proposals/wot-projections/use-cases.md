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

## Stage grouped data sets at the edge

An edge gateway collects readings from instruments over two protocol bindings.
Operations clients need a fast equipment-status data set and a slower utility-usage
data set, both served from gateway-hosted views. Each data set has its own plan.
A site overview plan with its own health readings
[organizes the two plans](./spec.md#31-organizing-plans) without importing their
properties.

The overview plan supplies a default publishing interval when the gateway resolves
a data set through its organizing link. Each data set's plan can set its own
defaults, and an [explicit property selector](./spec.md#55-observation-requests)
requests more frequent sampling for a critical reading. A binding-specific override
can account for different collection capabilities. The gateway can revise the
requested rates without adding them to the client-facing TDs. For bulk-selected
properties, a [form template](./spec.md#81-form-templates-for-bulk-selections)
can put the group and resolved property names in the gateway URI.

The team pins source revisions for the new data sets with source byte digests.
The gateway checks the pins and serves the new views in preview while production
continues to use the earlier pinned set. The team promotes the reviewed set
after checking the preview.

## Annex A: OPC UA use cases (informative)

OPC Unified Architecture (OPC UA) servers represent equipment and data as
nodes. An OPC UA View organizes existing nodes for browsing. These examples
illustrate how a server could expose a resolved projection using Views.

- **Browse a maintenance view of a pump.** The maintenance view selects the
  pump speed from an existing Pump TD. The server can organize the existing
  speed Variable in a View. The Variable exposes the speed value. The View
  doesn't duplicate the Variable or create another connection to the pump.
- **Organize views across a production line.** A line-level projection can
  link to a maintenance view that the server already exposes. The server can
  reuse the existing View rather than create a second one for the same source.
  The portable organizing link does not specify how to organize OPC UA nodes.
