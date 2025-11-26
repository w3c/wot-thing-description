# Proposal: Mapping data and managing complex intractions in WoT Thing Descriptions

The Web of Things (WoT) Thing Description (TD) provides an abstract model for describing a Thing's functionalities through its three traditional interaction affordances: Properties, Actions, and Events. This model excels at describing simple, atomic, and one-off interactions. However, complex systems — particularly those found in industrial automation, enterprise integration, and service orchestration — rely on interaction patterns that go beyond a simple request/response. These scenarios present two critical, unresolved challenges for the TD:

- Protocol Binding Complexity: The logical information (like state data or action input/output) must be mapped to the specific channels of various protocols (e.g., HTTP Headers, URI path variables, or specific binary payload formats like Modbus). Current TD mechanisms lack the necessary vocabulary to explicitly describe how abstract DataSchema elements are mapped to these diverse, channel-specific message components.
- Interaction Management Complexity: Traditional affordances struggle when interactions require ongoing oversight. These scenarios often transition from simple request/response into a more complex state machine or "application protocol."

While the WoT TD 1.1 introduced the concept of Manageable Actions via the `invokeaction`, `queryaction`, and `cancelaction` operations, the current model lacks the structure to support the full complexity of these long-running processes. Specifically, this gap includes the following:

- Runtime Data Handling: No support for managing dynamically generated identification (e.g., transaction or job IDs) across multiple protocol transactions.
- Queuing and Concurrency: Inability to describe and expose queues of actions.
- Multi-Affordance Dependencies: Missing mechanisms to describe complex alarms or state dependencies that involve the correlation of multiple affordances (a crucial feature in protocols like BACnet).

This proposed solution decided deliberately to connect two otherwise separate work items ([(Manageable Affordances](https://github.com/w3c/wot-thing-description/blob/main/planning/work-items/analysis/analysis-manageable-affordances.md) and ([Data Mapping](https://github.com/w3c/wot-thing-description/blob/main/planning/work-items/analysis/analysis-data-mapping.md))) to fill a logical common gap: mapping client side runtime state. In practice, the solution introduces two new concepts to the TD information model:

Variables (Runtime Data Holders): A mechanism to define reusable, structured **client-side** runtime data.

Capabilities / Clusters / Or? (Context and Management): A new top-level container that defines a stateful runtime context. It groups related affordances and, with a client state, establishes an explicit relationships between interactions (or group).

By establishing these two mechanisms, the TD can effectively model a very simple state machine and explicitly link different part of low level messages to the application layer.

---

## 2. Scope & Goals

- Fix the identified limitations in the WoT TD for complex interaction patterns.
- Define a simple yet powerful mechanism to cover most of the analyzed user stories and **implementations**.

---

## 4. Proposed Core Mechanisms

This section defines the two new, orthogonal concepts.

### 4.1 Concept A: Variables (Client side Runtime Data Modeling)

In the current TD model, we focused on describing interaction patterns between a client and a Thing. However, complex interactions often require the client to manipulate and manage the data exchanged with the remote Thing. To address this, we introduce the concept of **Variables**.

- **Definition:** **Variables** are internal, logical data structures defined within the TD scope to hold **runtime data** essential for complex interactions. They are _not_ automatically network-exposed Properties.
- **Role:** Serve as a clean way to describe the **mapping of runtime data** in an otherwise static document.
- **Declaration Mechanism:** A variable can be declared in any JSON schema that is used in the TD (e.g., as part of an Action input or output schema). Variables are identified by a unique name.
- **Usage:** A variable can be referenced in children elements of Affordances (e.g., in `forms` or `href` templates) using a defined syntax (e.g., `${variableName}`). When referenced, the client MUST create a two-way binding between the variable and the corresponding message component.

Example supporting [Data Mapping in HTTP](https://github.com/w3c/wot-thing-description/blob/main/planning/work-items/analysis/analysis-data-mapping.md#user-stories):

```json
{
  "actions": {
    "startJob": {
      "input": {
        "type": "object",
        "properties": {
          "jobType": { "type": "string", "variable": "jobType" },
          "priority": { "type": "integer" }
        }
      },
      "forms": [
        {
          "href": "http://example.com/jobs",
          "htv:methodName": "POST",
          "http:headers": {
            "X-Job-Type": "${jobType}"
          }
        }
      ]
    }
  }
}
```

In the example above, the `jobType` property in the Action input schema is marked as a Variable. When the client invokes the `startJob` action, it will bind the value of `jobType` to the `X-Job-Type` HTTP header in the request and the real payload sent to the the server will not contain the `jobType` field.

```json
{
  "priority": 5
}
```

If we want to support mapping low-level message parts, we can first map the low-level payload to our TD data model with a new keyword (e.g., `messageSchema`), and then use Variables to bind the runtime data to the low-level message parts.

Example:

```json
{
  "property": {
    "propX": {
      "type": "number",
      "variable": "propXValue",
      "forms": [
        {
          "href": "http://example.com/propX",
          "messageSchema": {
            "type": "object",
            "properties": {
              // User may choose to full specify the payload schema or just the part they want to map
              "value": { "type": "number", "variable": "propXValue" }
            }
          }
        }
      ]
    }
  }
}
```

The above example shows how to map a Property value to a low-level message payload using Variables. The `propXValue` variable is used to bind the Property value to the `value` field in the message payload (this works for both read and write operations).

#### Limitations & Future Work

- Dealing with mixed content-types (e.g., `PUT` body image + headers + query parameters) -> We actually still lack a way to model inputs/outputs that are files or other non-JSON data. Indeed, affordances that requires un-mapped content-types are encouraged to leave the "schema" part empty or use undefined. Future work may introduce a more formal way to model such cases.
- Complex data transformations -> Current proposal only supports direct 1:1 mapping between Variables and message components. Future work may introduce transformation functions or mapping expressions to support more complex scenarios.
- Protocol bindings may in the future introduce more advanced mapping mechanisms and decide a serialization format of structured variables (e.g., HTTP may declare that if a variable is type object and used in a query string, it can be serialized by restructuring the properties in X=Y query parameters).

#### Worth mention

We could also reconsider the use of JSON pointers for variable assignment instead of defining variables in the schema. This would not change the overall benefit. However, it would imply a dependency on other specification(s). The mechanism proposed here is self-contained and does not require external references (even if it is more simple). The implications of the feature proposed here are mostly on the client side implementation (i.e., the client must be able to manage runtime variables and bind them to message components) and profile-aware clients may just ignore the variable mechanism as it would probably be described by constraints in the protocol binding itself.

### 4.2 Concept B: Capabilities / Clusters (Context and Management)

Building on the Variables mechanism, we introduce a new top-level structural element called **Capability** (or Cluster or some better name) to encapsulate related Affordances and Variables. This construct provides a runtime context for managing complex interactions that require stateful managment.

- **Definition:** A **Capability** is a new top-level structural element that serves as a **runtime context** for a complex function. It groups a set of related Affordances and Variables.
- **Role:** Establish **scoping**, and define **relationships** between interactions.

---

The idea is that a Capability can define the following:

- **State (set of Variables):** Define runtime client data structure shared by all affordances listed in it (e.g., `activeJobQueue`).
- **Subaffordances:** Group related Actions, Properties, and Events that operate within the same context.
- **Model**: Without needing to define all the affordances from scratch every time, we can define a set of common Thing Models (e.g., AsyncActionThingModel).

Example:

```json
{
  "capabilities": {
    "PrintJobManager": {
      "state": {
        "type": "string",
        "variable": "jobId"
      },
      "properties": {
        "activeJobQueue": {
          "type": "array",
          "items": { "type": "string" },
          "forms": [
            {
              "href": "http://example.com/printjobs/queue",
              "htv:methodName": "GET"
            }
          ]
        }
      },
      "actions": {
        "submitPrintJob": {
          "input": {
            "type": "object",
            "properties": {
              "document": { "type": "string", "format": "uri" },
              "copies": { "type": "integer", "default": 1 }
            }
          },
          "output": {
            "type": "string",
            "variable": "jobId"
          },
          "forms": [
            {
              "href": "http://example.com/printjobs",
              "htv:methodName": "POST"
            }
          ]
        },
        "cancelPrintJob": {
          "input": {
            "type": "string",
            "variable": "jobId"
          },
          "forms": [
            {
              "href": "http://example.com/printjobs/${jobId}",
              "htv:methodName": "DELETE"
            }
          ]
        }
      },
      "events": {
        "jobCompleted": {
          "data": {
            "type": "string",
            "variable": "jobId"
          },
          "forms": [
            {
              "href": "http://example.com/printjobs/events"
            }
          ]
        }
      }
    }
  }
}
```

We can simplify by defining a common Thing Model for such Capabilities (e.g., `PrintJobManagerThingModel`) that pre-defines the common affordances and state variables. The TD can then just reference this model and only define any customizations needed.
Example:

```json
{
  "capabilities": {
    "PrintJobManager": {
      "model": "http://example.com/PrintJobManagerThingModel"
      // Customizations or overrides can be defined here if needed
    }
  }
}
```

#### Limitations & Future Work

- Naming and Terminology: The term "Capability" may conflict with existing IoT frameworks. Future work may explore alternative names like "Cluster" or "Module" or "Group" "RuntimeContext".
- Advanced Relationships: While this proposal introduces basic grouping and state management, future work may explore more advanced relationships between Capabilities (e.g., dependencies, hierarchies).
- Global operations still need to be defined outside capabilities (e.g., Thing level actions, see next sections).
- It is just one level of grouping. Future work may explore nested Capabilities or hierarchical structures altough this may add complexity.

---

#### A word about global operations (`queryall`, `readall`, `cancelall`, `readmultiple`, etc.)

Some of the user stories and implementations analyzed require global operations that span multiple affordances (e.g., `readall` properties, `cancelall` actions). These operations are orthogonal to the Capability concept and can be defined at the Thing level. In the past, we have pinpointed the criticalities of defining such global operations as new `op` values as they lack a proper way to describe their content type and schema. If we introduce this new concept, I don't see any issue in defining such global operations at the Thing level using the existing Action/Property/Event affordance structure. We can then still reuse regular mechanisms (e.g., input/output schemas, forms, etc.) to describe these global operations and their "multiple" counterparts is now straightforward to define. The only problem is that we may need to define new standard Thing Models for such global operations (e.g., `ReadAllPropertiesThingModel`, `CancelAllActionsThingModel`, etc.) to ensure consistency across different TDs.

## 5. New Vocabulary & Schema (Summary)

This section provides a summary of the newly introduced terms for the proposed concepts.

| New Field       | Location            | Data Type           | Description                                                               |
| :-------------- | :------------------ | :------------------ | :------------------------------------------------------------------------ |
| `variable`      | Inside DataSchema   | String              | Marks a property as a Variable with the given name.                       |
| `capabilities`  | Top-level map in TD | Map of Capabilities | Contains all defined Capabilities/Clusters.                               |
| `state`         | Inside a Capability | DataSchema          | Defines the client-side runtime data structures (e.g., `activeJobQueue`). |
| `model`         | Inside a Capability | String (URI)        | References a predefined Thing Model for the Capability.                   |
| `messageSchema` | Inside `form`       | DataSchema          | Defines the low-level message structure for mapping.                      |
