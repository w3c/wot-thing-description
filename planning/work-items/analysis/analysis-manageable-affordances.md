# Manageable Affordances Analysis

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/manageable%20affordances)

>  Traditional "interaction affordances" in WoT (Properties, Actions, Events) describe what a Thing can do or expose. Manageable Affordances, on the other hand, address scenarios where 
These interactions are not just one-off calls but require ongoing management, monitoring, or have dependencies on other interactions.

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
* **Why:** So that I can monitor and/or cancel a long running action without waiting indefinitely for its completion
* **Sentence:** As a Thing Description designer, I need to describe actions that can be monitored and canceled so that I can correctly describe the lifecycle of actions in automation systems.
* **Process Stakeholders**:
  - Submitter: Cristiano Aguzzi
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
* **Why:** So that I can fully describe the current status of a device capable of running persistent actions
* **Sentence:** As a Thing Description designer, I need to describe a queue of actions as a resource so that I can fully describe the current status of a device capable of running monitorable and cancelable actions.
* **Process Stakeholders**:
    * Submitter: Cristiano Aguzzi
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

## Other technologies (WIP)
This section analyzes the examples of implementation of the same user stories in other "well-known" or production technologies/frameworks. 

### AWS IoT 

- **Support for Asynchronous Actions**: Yes
- **Description**: AWS IoT provides the concept of Commands, which can be used to execute custom actions on devices. Since its beginning, AWS IoT was more focused on data gathering on top of MQTT, but with commands they wanted to add the ability to execute remote operations on devices. Commands are basically a small interaction "protocol" on top of MQTT. They define a set of topics to simulate request/response semantics, but also enable the ability to listen for status updates. It seems that you can't cancel commands. There is also the concept of "Jobs", by they are more about provisionng and managing devices (or a fleet of devices) and it is more like a script that should be executed on the device, rather than a single action that can be monitored or cancelled. Another pattern of implementing an asychronous action is to use a Shadow Device, which is a virtual representation of a device that can be used to manage the device's state. Basically, a shared JSON document that represent the state with two field `desired` and `reported`. The `desired` state is the state that the device should be in, while the `reported` state is the state that the device is currently in. To implement an asynchronous action, you can update the `desired` state and then listen for changes in the `reported` state. This is a more complex pattern, but it is supported by AWS IoT and the application should know the semantics of the state changes.
- **Support for queue**: Implicitly supported through MQTT topics. But the device might reject execution of multiple commands if it is busy.
- **Reference**: [AWS IoT Commands](https://docs.aws.amazon.com/iot/latest/developerguide/iot-remote-command-concepts.html)

### Particle IoT
- **Support for Asynchronous Actions**: No
- **Description**: Particle IoT does not have a built-in concept for asynchronous actions but only supports synchronous action invocations. Developers can deploy workarounds to achieve similar functionality, such as using a combination of events and functions to simulate asynchronous behavior.
- **Support for queue**: No
- **Reference**: [Particle Functions](https://docs.particle.io/reference/cloud-apis/api/#call-a-function)

### Azure IoT Hub 
- **Support for Asynchronous Actions**: No
- **Description**: Azure IoT Hub does not have a built-in concept for asynchronous actions. It supports direct methods, which are synchronous and do not allow for monitoring or cancelling. However, it does support device twins, which can be used to manage the state of devices, but this is more about state management than execution of actions.
- **Support for queue**: No
- **Reference**: [Azure IoT Hub Direct Methods](https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-direct-methods)

### ECHONET (TODO)

### Goolg IoT Cloud (TODO)

### Arduino IoT Cloud (TODO)

### Home Assistant (TODO)

### Tasmota Firmware (TODO)

### Philips Hue Smart Lighting (TODO)

### Shelly Devices (TODO)

### Sonoff Devices (TODO)

### SmartThings Devices (TODO)
 
### Tuya IoT (TODO)

## Summarized Problem

Will be done after collecting the user stories and all related issues

## Requirements

Will be done after everything else
