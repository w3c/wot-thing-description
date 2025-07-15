# Manageable Affordances Analysis

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/manageable%20affordances)

>  Traditional "interaction affordances" in WoT (Properties, Actions, Events) describe what a Thing can do or expose. Manageable Affordances, on the other hand, address scenarios where 
These interactions are not just one-off calls but require ongoing management and/or monitoring, and/or have dependencies on other interactions.

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
This section analyzes implementation examples of the same user stories in other "well-known" or production technologies/frameworks. 

### AWS IoT 

- **Support for Asynchronous Actions**: Yes
- **Description**: AWS IoT provides the concept of Commands, which can be used to execute custom actions on devices. Since its beginning, AWS IoT was more focused on data gathering on top of MQTT, but with Commands they wanted to add the ability to execute remote operations on devices. Commands are basically a small interaction "protocol" on top of MQTT. They define a set of topics to simulate request/response semantics, and also enable the ability to listen for status updates. It seems that you can't cancel Commands. There is also the concept of "Jobs", but these are more about provisioning and managing devices (or a fleet of devices) and are more like scripts that should be executed on the device, rather than a single action that can be monitored or cancelled. Another pattern of implementing an asynchronous action is to use a Shadow Device, which is a virtual representation of a device that can be used to manage that device's state. A Shadow Device is basically a shared JSON document that represents the state with two fields: `desired` and `reported`. The `desired` state is the state that the device should be in, while the `reported` state is the state that the device is currently in. To implement an asynchronous action, you can update the `desired` state and then listen for changes in the `reported` state. This is a more complex pattern, but it is supported by AWS IoT, and the application should know the semantics of the state changes.
- **Support for queue**: Implicitly supported through MQTT topics, but the device might reject execution of multiple commands if it is busy.
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

### Goolg IoT Cloud 
Discontinued.

### Arduino IoT Cloud 
- **Support for Asynchronous Actions**: No
- **Description**: Arduino IoT Cloud is a platform for connecting and managing Arduino devices online. It supports defining device "properties" (variables that represent device state), "events" (notifications triggered by changes or conditions), "timeseries" (historical data logging), and "triggers" (rules that execute actions based on property changes or events). Actions are typically synchronous and are executed as soon as a trigger condition is met. There is no built-in mechanism for monitoring, cancelling, or queuing actions. The platform is designed for simplicity and rapid prototyping, focusing on state synchronization and event-driven automation rather than complex asynchronous workflows.
- **Support for queue**: No
- **Reference**: [Arduino Cloud Documentation](https://docs.arduino.cc/cloud/)

### Home Assistant
- **Support for Asynchronous Actions**: No
- **Description**: Home Assistant is an open-source platform for smart home automation that models devices as entities with states and attributes. Actions are performed via "services" that interact with these entities, typically resulting in synchronous changes. While Home Assistant supports automations, scripts, and scenes to orchestrate complex behaviors, there is no built-in mechanism for asynchronous action execution or monitoring/cancellation of actions. State changes can be tracked, but commands are not queued or managed asynchronously. Advanced workflows can be implemented using automations, but these go beyond the single device management and are mostly higher level abstractions.
- **Support for queue**: No
- **Reference**: [Home Assistant Entities](https://www.home-assistant.io/docs/configuration/entities_domains/)


### Tasmota Firmware

- **Support for Asynchronous Actions**: Yes, sort of. 
- **Description**: Tasmota is a command-centric framework where nearly every interaction, including reading the device's state, is performed by sending a command. Since its main transport protocol is MQTT, most results of these commands can be read asynchronously. While the execution of a single command on the device is synchronous, Tasmota publishes the result or the new state to predefined stat/ and tele/ MQTT topics. This decouples the command invocation from the result, allowing any client to subscribe to these topics and asynchronously monitor the device's status. There is no native concept of "canceling" a command once it has been issued.Furthermore, the Backlog command provides a mechanism to send a batch of commands asynchronously; the device queues this sequence and executes it without further interaction from the client.
- **Support for queue**: Yes, sort of (again). Supported through the `Backlog` command. The `Backlog` command allows you to send a single string containing multiple commands separated by semicolons. Tasmota will place these commands into a queue and execute them sequentially. This is a single queue, and as Tasmota is single-threaded, it will process the backlog before handling new incoming commands. You can clear the backlog (effectly similar to cancelling the queued commands) and you can listen to its progression by subscribing to the relevant command result topics.
- **Reference**: [Tasmota Commands Documentation](https://tasmota.github.io/docs/Commands/)

### Philips Hue Smart Lighting

Sadly, it seems I can't disclose any information about Philips Hue Smart API as explained in the [terms and conditions](https://developers.meethue.com/terms-of-use-and-conditions/) of the API documentation:
> Confidentiality: You shall not disclose to any person the Developer Content or any other information of a confidential nature provided to you by Signify, including Feedback (“Confidential Information”), except that you may disclose the Confidential Information: (i) to employees, officers, representatives or advisers of the company you work for and who need to know such information for the purposes of carrying out your obligations under these Terms (“Representatives”), provided that the Representatives comply with the confidentiality obligations under this clause; and (ii) as may be required by law, court order or any governmental or regulatory authority. You shall not use the Confidential Information for any purpose other than to perform your obligations under these Terms.

### Shelly Devices (TODO)

### Sonoff Devices (TODO)

### SmartThings Devices (TODO)
 
### Tuya IoT (TODO)

## Summarized Problem

Will be done after collecting the user stories and all related issues

## Requirements

Will be done after everything else
