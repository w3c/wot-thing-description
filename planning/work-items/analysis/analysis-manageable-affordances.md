# Manageable Affordances Analysis

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/manageable%20affordances)


Various use cases require the implementation of more complex actions that span multiple protocol transactions. Such actions are not simply invoked but need to managed over time by the Thing and the Consumer.
These are covered in the WoT Thing Description 1.1 via the initiation (invokeaction), monitoring (`queryaction`), and cancellation (`cancelaction`) of ongoing actions.
However, the following points are not supported:

- Sent and received payloads associated to the operations
- Management of dynamically generated identification
- Describing queues of actions
- Describing alarms that involve multiple affordances (see BACnet Binding Alarms)

These limitations are also influencing the Profiles.

Additionally, there have been proposals by the WG members that need to taken into account and evaluated:

- <https://github.com/w3c/wot-thing-description/tree/main/proposals/hypermedia-control>
- <https://github.com/w3c/wot-thing-description/tree/main/proposals/hypermedia-control-2>
- <https://github.com/w3c/wot-thing-description/tree/main/proposals/hypermedia-control-3>

Related Issues:

- <https://github.com/w3c/wot-thing-description#1692>
- <https://github.com/w3c/wot-thing-description#1644>
- <https://github.com/w3c/wot-thing-description#1223>
- <https://github.com/w3c/wot-binding-templates/pull/379>

Related Real World Implementations:

- BACnet Alarms: See the full discussion at <https://github.com/w3c/wot-binding-templates/pull/379>
- OpenFlexure Microscope: Multiple long-running affordances. See [TD](https://github.com/w3c/wot-testing/tree/main/events/2024.11.Munich/TDs/openflexure) and [presentation](https://www.youtube.com/watch?v=TI6HUOw6lhU)

## User Stories

TBD

### Use Cases From Autonomous Agents on the Web CG

The CG has collected some use cases on the topic not limited to WoT. The ones below are limited to the scope of WoT. These should be analyzed and extended to understand the user story and required features:

- https://github.com/w3c-cg/webagents/issues/40
- https://github.com/w3c-cg/webagents/issues/31
- https://github.com/w3c-cg/webagents/issues/30
- https://github.com/w3c-cg/webagents/issues/29
- https://github.com/w3c-cg/webagents/issues/28
- https://github.com/w3c-cg/webagents/issues/27
- https://github.com/w3c-cg/webagents/issues/26

## Existing Solutions

TBD

## Summarized Problem

Will be done after collecting the user stories and all related issues

## Requirements

Will be done after everything else
