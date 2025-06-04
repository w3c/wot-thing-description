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

- https://github.com/w3c/wot-thing-description/issues/1692
- https://github.com/w3c/wot-thing-description/issues/1644
- https://github.com/w3c/wot-thing-description/issues/1223
- https://github.com/w3c/wot-binding-templates/pull/379
- https://github.com/w3c/wot-thing-description/issues/1779
- https://github.com/w3c/wot-thing-description/issues/899
- https://github.com/w3c/wot-thing-description/issues/887 (sort of related, but we can move it to data binding)
- https://github.com/w3c/wot-thing-description/issues/1605
- https://github.com/w3c/wot-thing-description/issues/1408
- https://github.com/w3c/wot-thing-description/issues/1070

Related Real World Implementations:

- BACnet Alarms: See the full discussion at <https://github.com/w3c/wot-binding-templates/pull/379>
- OpenFlexure Microscope: Multiple long-running affordances. See [TD](https://github.com/w3c/wot-testing/tree/main/events/2024.11.Munich/TDs/openflexure) and [presentation](https://www.youtube.com/watch?v=TI6HUOw6lhU)

## User Stories

### Monitorable and Cancelable Actions

* **Who:** Thing Description designer / Device Manufacturer / System integrator
* **What:** Describe actions that can be monitored and canceled
* **Why:** I can describe the lifecycle of actions in automation systems
* **Sentence:** As a Thing Description designer, I need to describe actions that can be monitored and canceled so that I can correctly describe the lifecycle of actions in automation systems.
* **Process Stakeholders**:
  - Submitter: Multiple
  - Specification Writers: 
  - Implementation Volunteers: 
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: Increase complexity of the WoT interaction model. This implies an increase in implementation complexity of both Consumer and Exposer applications. Finally, the Thing Description design process might result
    more complex too. 
* **Linked Use Cases or Categories:**
    * https://github.com/w3c-cg/webagents/issues/26
    * https://github.com/w3c-cg/webagents/issues/27
    * https://github.com/w3c-cg/webagents/issues/29
    * https://github.com/w3c-cg/webagents/issues/31

### Queue of Actions

* **Who:** Thing Description designer
* **What:** Describe a queue of actions as a resource, including its contents and state
* **Why:** I can fully describe the current status of a device capable of running persistent actions
* **Sentence:** As a Thing Description designer, I need to describe a queue of actions as a resource so that I can fully describe the current status of a device capable of running monitorable and cancelable actions.
* **Process Stakeholders**:
    * Submitter: Multiple
    * Specification Writers:
    * Implementation Volunteers:
    * Impacted People: TD Designers, Consumer application developers.
    * Impact Type: Increase complexity of the WoT interaction model. This implies an increase in implementation complexity of both Consumer and Exposer applications. 
* **Linked Use Cases or Categories:**
   * https://github.com/w3c/wot-thing-description/issues/1070
   * https://github.com/w3c/wot-thing-description/issues/1779

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
