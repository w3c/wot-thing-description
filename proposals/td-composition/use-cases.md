# Use cases for TD Composition and Reuse

These scenarios illustrate the [draft proposal](./spec.md) for reuse between
concrete Thing Descriptions (TDs). Choose the relationship based on what the
consumer needs: a whole description as a starting point, a link to a child
Thing, or one definition. The operators are provisional. The scenarios don't
settle open questions about inheritance, overrides, or flattening.

## Extend a description for one installation

A campus operator publishes a base TD for a lighting controller with controls
for switching and dimming. An installation also exposes occupancy status.
The author wants to describe the installation without copying the entire base
description.

The installation TD uses [`td:extends`](./spec.md#5-tdextends-between-tds) to
identify the base TD and adds an occupancy property. The intended result
describes the installation under its own `id`, without modifying the base TD.
If the base and installation define the same property name, the proposal still
needs to decide how to handle the conflict. Inherited forms can't silently
move to the installation's base URI or acquire its security settings.

## Navigate from an assembly to its child Things

A greenhouse controller groups irrigation zones. Each zone has its own TD,
identifier, and interaction forms. A client starts with the controller and
needs to discover the zone it can manage.

The controller TD uses [`td:subthing`](./spec.md#6-tdsubthing-between-tds) to
link to each zone TD. A link can name the child with `instanceName`, for
example `eastZone`. The client follows the link and uses the child TD to
interact with the zone. The relationship alone doesn't add the child's
affordances to the controller. If the application needs a separate interface
that combines selected affordances, see [Projection Plans](../wot-projections/use-cases.md).

## Reuse one affordance from another TD

A building dashboard needs the battery status of a deployed sensor. It doesn't
need the sensor's configuration actions or its other properties. Copying the
status definition would leave the dashboard responsible for keeping its schema
and forms in sync with the sensor.

The dashboard TD uses [`td:ref`](./spec.md#7-tdref-between-tds) to refer to the
sensor TD and its `/properties/batteryStatus` JSON Pointer. The processor
resolves that definition and the dependencies it needs, such as a referenced
schema or security definition. The intended result reuses the selected
definition, not the sensor's full interface. If the pointer or a required
dependency can't be resolved, the processor doesn't return a usable affordance
with missing pieces.

## Annex A: OPC UA use cases (informative)

OPC Unified Architecture (OPC UA) servers expose assets and their data as
nodes connected by references. The following cases illustrate how these TD
relationships could be used with the [draft OPC UA WoT Binding][OPC review].
They don't define new native references or node identities.

- **Navigate a pump skid.** A skid TD links to the separately described drive
  and pressure transmitter using `td:subthing`. A WoT client can navigate to
  each child's TD and use its forms. The WoT relationship isn't a substitute
  for configuring the server's own model of the skid.
- **Reuse one live measurement.** A diagnostics TD uses `td:ref` to reuse a
  pressure measurement from the transmitter's TD. The reference identifies
  the WoT definition, not an OPC UA node identifier. Its resolved form still
  describes the source interaction and its security requirements. Reuse
  doesn't create a second measurement or grant permission to read it.

[OPC review]: https://github.com/OPCF-Members/OPC10100-WoT/pull/56
