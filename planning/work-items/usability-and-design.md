# TD.Next Usability and Design Work Items

Changes that improve readability, the usability of the specification OR development, spec generation, bug fixes, and testing of the specification do not need use cases.
These have more priority since they can impact how new features look like in a TD instance.

## Design Document

We should start a TD (re)design document that explains the idea behind the design of different features. See [issue 1889](https://github.com/w3c/wot-thing-description/issues/1889).

## Document reorganization

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/document%20reorganization)

Changes that should be done while keeping the current content

### Common Definition Section

Usability and readability improvements for not needing to "jump around" while reading

### Grouping of Normative Requirements

Making sure that important normative text is not scattered around too much.

### Assertion id Alignment

Adding `td`, checking naming scheme

### Better Integration of Thing Model

There were questions about how much a TM is related to the TD.
Some discussion might be needed.

## Synchronization with Other Documents

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/document%20synchronisation)

### Discovery Sync

Moving discovery-related text from TD to Discovery

### Architecture Sync

Checking overlaps with architecture.

## Reusable TD Elements

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/reusable+elements)

### Reusable Connections

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/reusable%20connections)

TODOs:

- Move the "Process Stakeholder" definitions somewhere:
  - Submitter: People who have submitted the user story, is interested in it and thus wants this story to be succesful.
  - Specification Writers: People from the TF who want to (or can) work on writing the specification text and corresponding resources.
  - Implementation Volunteers: People who want to implement this and contribute the results to the implementation report. The submitter is strongly encouraged to provide an implementation result.
  - Impacted: Entities that will be impacted by this. Impact type can be "implementation overhead", "security", "privacy", "accesibility" etc. and should be prefixed with `-` if it is a negative change, e.g. there is less implementation overhead but privacy issues arise. Some lists to look at: https://w3c.github.io/wot-usecases/#stakeholders , https://w3c.github.io/wot-security/#wot-threat-model-stakeholders

**User Stories:**

1. Connection Oriented Protocols

- **Who:** Deployer of devices with connection oriented protocols
- **What:** Reusable Connection descriptions in a TD
- **Why:** Better describe connection oriented protocols such as MQTT and WebSockets (Problem nb. 4 below)

- Sentence: **As a** deployer of devices with connection oriented protocols, **I need** reusable connection descriptions in a TD, **so that I can** better describe connection oriented protocols such as MQTT and WebSockets (Problem nb. 4 below)
- Process Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Ege Korkan
  - Implementation Volunteers: Ege Korkan
  - Impacted People: TD Designers and Consumer application developers.
  - Impact Type: Less implementation overhead for TD Designers. More implementation overhead for Consumer application developers for building the request. Less implementation overhead when identifying protocol driver parameters.
- Linked Use Cases or Categories: https://w3c.github.io/wot-usecases/#UC-open-field-agriculture-1

2. Reusable Defaults per TD

- **Who:** Designer/Developer of TDs
- **What:** Reusable Connection descriptions in a TD
- **Why:** Simplify TDs in cases without usage of default terms or to avoid redundancy (Problem nb. 1, 2 and 3 below)

- Process Sentence: **As a** designer/developer of TDs, **I need** reusable connection descriptions in a TD, **so that I can** simplify TDs in cases without usage of default terms or to avoid redundancy (Problem nb. 1, 2 and 3 below).
- Stakeholders:
  - Submitter: Multiple
  - Specification Writers: Ege Korkan
  - Implementation Volunteers: Ege Korkan
  - Impacted: TD Designers and Consumers. Type: Implementation Overhead
- Linked Use Cases or Categories: Category "Ease of TD writing" to be created

**Summarized Problem:**

Currently, each form of an affordance has information on the endpoint, media type and other protocol related information.
It is possible to use the base term for simplifying the endpoint but it has limitations such as:

1. If the media type is common across forms but is not `application/json`, it is repeated in each form.
2. If there are common protocol stack configurations such as different default verbs, baud rates, and endianness, they are repeated in each form
3. Multiple bases are not possible. Thus, each form repeats multiple bases. This is relevant when a TD has local and public IP addresses
4. For protocols that are based on an initial connection and then subsequent messages, the semantics are not clear. Thus, a Consumer can establish multiple connections instead of reusing the initial connection. See the Example of the Message Flow section below

Related Issues:

- Umbrella Issue: <https://github.com/w3c/wot-thing-description/issues/1248>
- Media Type and Security Override: <https://github.com/w3c/wot-thing-description/issues/204>: Sharing a media type and security (already possible) among forms
- Single base with multiple protocols: <https://github.com/w3c/wot-thing-description/issues/803>: Having the same feature as the `security` term in form protocols
- Reused Connection: <https://github.com/w3c/wot-thing-description/issues/878>: Implying a first connection that is not dropped but actually reused later
- Out-of-band IP address: <https://github.com/w3c/wot-thing-description/issues/977>: Sort of related. Deducing the IP address from an out-of-band way
- Reused Connection in WS: <https://github.com/w3c/wot-thing-description/issues/1070>: Similar issue to 878 but giving more details on WebSocket
- Linking to Initial Connection: <https://github.com/w3c/wot-thing-description/issues/1242>: Similar issue to 803.
- Reused Connection in WS 2: <https://github.com/w3c/wot-thing-description/issues/1664>: Similar issue to 878 abd 1070
- Linking to Initial Connection 2: <https://github.com/w3c/wot-thing-description/issues/1834>: Similar issue to 803 and 1242

**Requirements**

- There are 3 main points. Point 2 is about a keyword (more or less), whereas point 3 is more about the underlying mechanism.
  1. Having a place to put common connection information
  2. Linking to a common connection information.
  3. Signaling that a form in an affordance can reuse the connection established before so that the Consumer does not open a new connection per operation execution
- We want a global media type that behaves the same way as `security` in the root level, i.e. each form that does not have a `contentType` key, uses the one defined globally, somewhere in the root level of the TD. Relevant issues: https://github.com/w3c/wot-thing-description/issues/204 , https://github.com/w3c/wot-binding-templates/issues/357 . Points to pay attention:

  - In case of affordances that are incompatible with the global media type, overriding must be mandated. An unstructured data at root level, e.g. jpeg, must be overridden by an affordance that has data schema.
  - Negative: Message serialization from TD consumption will be more complex as a preprocessing of the TD is now needed. If there are multiple global media types, referring to them and resolving those will increase the complexity of the preprocessing step.
  - Positive: It is easier check for the Consumer, which media types (their decoder/encoder) are needed to be supported to talk to the Thing. Furthermore, as can be understood in the BACnet issue, it is currently not clear that a form requires a media type. This addition can help with this.
  - These negative and positive aspects will be visible in other points and can be named "tradeoffs". As mentioned in https://github.com/w3c/wot-thing-description/issues/803#issuecomment-526386771, any optimization of TD instances create more processing need while making them easier to understand and write by humans, at least in simpler cases.
  - Linking aspect is common to single connection and single base points

- We want to support multiple base URIs that behaves the same way as `securityDefinitions` in the root level, where each form can contain a relative URI and refer to a base, like we do now with `security`. Relevant issues: https://github.com/w3c/wot-thing-description/issues/803, https://github.com/w3c/wot-thing-description/issues/878 (starting at https://github.com/w3c/wot-thing-description/issues/878#issuecomment-598714052)

  - Proposals are available in #878: on the container structure called `connections`, `endpoints`: https://github.com/w3c/wot-thing-description/issues/878#issuecomment-924158987
  - Proposal about the container at https://github.com/w3c/wot-thing-description/issues/1070#issuecomment-815095825
  - Mention that canonical TDs can contain the expanded forms with everything doubled. This is applicable to global media type mentioned above.

- An initial connection to the Thing should be expressed somehow. This avoids misinterpretation of reopening a connection twice, when there is no need and gives correct semantics for some protocols. Relevant Issues: #878, #977, #1070, #1242, #1664

  - Proposals are available in #878 to:
    - have an `op` value called `open` or a signifier to establish a connection. Consensus from Sept15, 2021 is to not have an op. https://github.com/w3c/wot-thing-description/issues/878#issuecomment-920148181
    - `dependsOn` keyword in non-base forms
  - A proposal in #977 shows URL templating to refer to the base connection: https://github.com/w3c/wot-thing-description/issues/977#issuecomment-702397973
  - Proposal in https://github.com/w3c/wot-thing-description/issues/1070#issuecomment-815095825 for linking via pointers and has two proposals
  - The Consumer should be smart to not open new connections, even without this. This only makes it clearer for humans and simpler implementations.
  - There needs to be a way to signal a connection shared for multiple Things. See #1664.

- Wrapper Schemas comes into question if all communication over that initial connection follows the same message structure. Related issues https://github.com/w3c/wot-thing-description/issues/878#issuecomment-888433789. This is relevant to global media type and security in a way. Also relates to data mapping.

**Notes:**

- When to close the connection needs to be discussed.
- Complex security mechanisms exchange should be handled at the same time

#### Examples of Message Sequences

##### Simple HTTP Connection

###### Participating Entities

![Participating Entities](./images/initial-connection-HTTP-entities.svg)

In this case, the Thing has enough resources and contains its own HTTP server.

###### Lifecycle of a Connection

![Lifecycle of a Connection](./images/initial-connection-HTTP-lifecycle.svg)

1. A request from the client opens the connection to the server.
2. A response from the server back to the client closes the connection.
3. If the server provides no response in a given time interval, a timeout occurs and the connection is closed.
4. Alternatively, a request can be sent with Keep Alive parameters (timeout and max requests parameters).
5. In this case, the responses back to the client will not close the connection.
6. If a certain amount of requests have been sent, the connection will be closed.
7. If a certain time is reached, the connection will be closed.

###### Message Sequence

![Message Sequence](./images/initial-connection-HTTP-sequence.svg)

We note that even with Keep Alive option set, the interaction pattern do not change in the application level.
Thus, keep alive can be seen as an optimization and not a different way to interact.

##### Broker Connections without Security

###### Participating Entities

![Participating Entities](./images/initial-connection-Broker-entities.svg)

Typically, the broker is a separate entity than the Thing.

###### Lifecycle of a Connection

![Lifecycle of a Connection](./images/initial-connection-Broker-lifecycle-connection.svg)

1. A client connects to the broker and opens a consistent connection.
2. Client can subscribe or publish to topics as long as the connection is active.
3. Client can disconnect from the broker and close the connection.
4. If the device turns off or has an error, the connection can be closed.

###### Lifecycle of a Subscription

![Lifecycle of a Subscription](./images/initial-connection-Broker-lifecycle-subscription.svg)

1. A Client already connected to the broker (open connection), can subscribe to a topic where that subscription becomes active.
2. Multiple messages can be received while the subscription is active.
3. Once the client unsubscribes from the topic, the subscription becomes inactive.

###### Message Sequence

![Message Sequence](./images/initial-connection-Broker-sequence.svg)

We note that, even after a time has passed, the connection stays open and the subscription stays active.
The client id is used in a connection but is typically not exposed to the application layer.

##### Basic WebSocket Connections

###### Participating Entities

![Participating Entities](./images/initial-connection-Websocket-entities.svg)

In this case, the Thing has enough resources and contains its own WebSocket server.

###### Lifecycle of a Connection

![Lifecycle of a Websocket connection](./images/initial-connection-Websocket-lifecycle.svg)

The lifecycle of a WebSocket connection in the Web of Things typically includes the following stages:

1. **Connection Establishment**: The client initiates a handshake request to the server, which responds with a handshake response, establishing a persistent connection.
2. **Data Transmission**: Once connected, the client and server can exchange data bi-directionally in real-time, with messages sent as frames. This may include ping/pong frames to keep understand connection "liveness" between the parties.
3. **Connection Closure**: Either party can initiate the closing handshake by sending a close frame, after which the connection is terminated, and resources are released.

###### Message Sequence

![Message Sequence](./images/initial-connection-Websocket-sequence.svg)

##### OAuth2-based Interaction

###### Participating Entities

![Participating Entities](./images/initial-connection-OAuth2-entities.svg)

In this case, the Thing has enough resources and contains its own HTTP server.

###### Lifecycle of a Session

![Lifecycle of a Oauth Session](./images/initial-connection-OAuth2-lifecycle.svg)

The lifecycle of an OAuth token in a session involves the following stages:

1. **Token Request and authorization**: The client requests an access token from the authorization server, typically after authenticating and obtaining user consent.
2. **Token Use**: The client uses the access token to access protected resources on the resource server by including it in API requests.
3. **Logout**: The client or authorization server can revoke tokens to terminate the session, preventing further access.
4. **Token Expiry and Refresh**: Access tokens are time-limited. If a refresh token is available, the client can request a new access token without user reauthorization.

###### Message Sequence

![Message Sequence](./images/initial-connection-OAuth2-sequence.svg)

##### Proxy-based Communication

###### Participating Entities

![Participating Entities](./images/initial-connection-Proxy-entities.svg)

In this case, the Thing has enough resources and contains its own HTTP server.

###### Lifecycle of a Connection

![Lifecycle of a Proxy](./images/initial-connection-Proxy-lifecycle.svg)

###### Message Sequence

![Message Sequence](./images/initial-connection-Proxy-sequence.svg)

#### New Proposals

##### Ege

Title: Common Connection Information is placed in a top-level element

- An object like `securityDefinitions`, where keys can be chosen by the TD designer.
- Inside each key, we have all elements of a form except the op keyword and an additional `reusable` keyword with a boolean. It would be false for HTTP, true for broker-based connections or WebSockets.
- If not otherwise defined in a form, the value of `connection` in the root level is used as a default in that form
- Any form that redefines the values of the connection, replaces them.
- If a value is not defined in the connection, the value in forms are taken
- If a value is not defined in the connection nor form, the defaults of the binding or TD spec are taken

```js
{
    "connections": { // Should this be named to something more generic? e.g. `defaults`, `components` (like OpenAPI), `commonDefinitions`, `definitions`, `commonConnectionInformation`
        "basichttp" : { //trying to put EVERYTHING possible
            "href": "https://example.com", // usual base URI
            "contentType": "application/cbor", // This is the default for this Thing's forms
            "security":["basic_sc"], // must be defined in securityDefinitions first
            "htv:methodName":"POST", // This is the default for this Thing. Even a property read would be with POST unless otherwise specified
            "reusable": false, // to be discussed. Can be deduced from binding
        },
       "broker" : {
            "href": "mqtt://www.w3.org/2019/wot/broker",
            "contentType": "text/plain",
            "security":"no_sc",
            "reusable": true,
            // for how long can the connection be reused?
        }
    },
    "title": "test",
    "securityDefinitions": { // should these be also embedded into connections?
        "no_sec": {
            "scheme": "nosec"
        },
        "basic_sc":{
            "scheme": "basic"
        }
    },
    "security": "no_sec", // it is probably not needed anymore -> Should we say that if there is connections element, security and base are not allowed?
    "connection": "basichttp", // like security, this is the default connection to be used throughout
    "properties": {
      "prop1": {
           "type":"string",
            "forms": [
                {
                   "connection": "broker",
                   "op": "readproperty",
                   "href": "",
                   "base":"application/devices/" // kind of weird, let's discuss :)
                   "mqv:topic": "application/devices/thing1/program/commands/reset""mqv:"
                }
            ]
        },
        "prop2": {
            "type":"string",
            "forms": [
                {
                    "connection": "basichttp",
                    "op":["readproperty"],
                    "href": "myDevice/properties/prop2",
                    "htv:methodName":"GET"
                },
                {
                    "connection": "basichttp",
                    "op":"writeproperty",
                    "href": "myDevice/properties/prop2"
                    // default is POST
                }
            ]
        }
    }
}
```

- The following two are the same TD

```js
{
    "connections": {
        "basichttp" : {
            "href": "https://example.com",
            "contentType": "application/cbor",
            "security":"basic_sc",
            "htv:methodName":"POST",
            "reusable": false
        }
    },
    "title": "test",
    "securityDefinitions": {
        "basic_sc":{
            "scheme": "basic"
        }
    },
    "connection": "basichttp", // can be ignored if there is only one connection?
    "properties": {
      "prop1": {
           "type":"string",
            "forms": [
                {
                   "op": "readproperty",
                   "href": "myDevice/properties/prop1"
                   // reading with POST in this case
                }
            ]
        },
        "prop2": {
            "type":"string",
            "forms": [
                {
                    "op":["readproperty"],
                    "href": "myDevice/properties/prop2",
                    "htv:methodName":"GET"
                },
                {
                    "op":"writeproperty",
                    "href": "myDevice/properties/prop2"
                    // default is POST
                }
            ]
        }
    }
}
```

```js
{
    "base": "https://example.com",
    "security":"basic_sc"
    "title": "test",
    "securityDefinitions": {
        "basic_sc":{
            "scheme": "basic"
        }
    },
    "properties": {
      "prop1": {
           "type":"string",
            "forms": [
                {
                   "op": "readproperty",
                   "contentType":"application/cbor",
                   "href": "myDevice/properties/prop1",
                   "htv:methodName":"POST"
                }
            ]
        },
        "prop2": {
            "type":"string",
            "forms": [
                {
                    "op":["readproperty"],
                    "contentType":"application/cbor",
                    "href": "myDevice/properties/prop2",
                    "htv:methodName":"GET"
                },
                {
                    "op":"writeproperty",
                    "contentType":"application/cbor",
                    "href": "myDevice/properties/prop2"
                    "htv:methodName":"POST"
                }
            ]
        }
    }
}
```

With the second TD (v1.1), we can see that it got longer due to not using the defaults of the binding. This effect would be amplified with the number of the affordances and forms the TD has.

##### Luca - Form-reuse + Connection descriptors

Design ideas for Form-reuse:

- `Form` gains two additional fields: `reusable` and `base`.
- `Thing` gains an additional field: `bases` (`connections` in Ege's proposal).
- `Thing::bases` is a container of `Form defaults`, a dictionary of Forms.
- The `base` field is a string matching one of the keys of `Thing::bases`.
- There is a single-inheritance pattern given by `Form::base`
  - you can use the fields in the `Form` referred in `Form::base` as default for all the fields not present in the current `Form`
  - `href` is additive; if present, it must be added to the `href` provided by the `base` (see normal approach to adding URIs)
  - if `base` is set in the Form referred to by the current Form `base`, the base form has to be resolved first.
    - Implementation-wise, all the Forms in `Thing::bases` can be resolved once and the result cached.
  - All the other fields simply replace the default if they exist in the current Form
- The `reusable` field is a boolean
- A Consumer MAY decide to keep a connection alive and reuse it if `Form::reusable` is true; the exact behaviour is protocol-dependent
  - if `Form::reusable` is set to false, the Consumer MUST tear down the connection and start anew.

This make it simpler to reuse Forms, and provides the minimum amount of information to tell if a Consumer can reuse a connection.

Design ideas for Connection descriptors

- `Form` loses `subprotocol`
- `Form` gains `protocol`
- `Thing` gains `protocols` and `connections`
- `Thing::connections` is a dictionary
  - The key is a string
  - The value is an Object with the following fields
    - `href` providing the connection path if applies
    - Any protocol-specific fields to be used to describe the connection
- `Thing::protocols` is a dictionary
  - The key is a string
  - The value is a protocol identifier or an Object with the following fields
    - A mandatory `protocol` containing a protocol identifier
    - Additional protocol-specific fields
- `Form::protocol` contains a string matching a key in `Thing::protocols`
- `Form::connection` contains a string matching a key in `Thing::connections`

Open questions:

- Can we move the security machinery to connection?
- Shall we add connection to Link as well?
- Shall we add another dictionary `key - {protocol, connection}` ?
  - Should the key be a scheme and shall we use it to set thing-wide defaults? e.g.:
    - `https` implies `{"protocol": "htv", "connection": "tls"}`

```js
{
    "bases": { // Should this be named to something more generic? e.g., `defaults`, `components` (like OpenAPI), `commonDefinitions`, `definitions`, `commonConnectionInformation`
        "basichttp1" : { //trying to put EVERYTHING possible
            "href": "https://example.com", // usual base URI
            "contentType": "application/cbor", // This is the default for this Thing's forms
            "security":["basic_sc"], // must be defined in securityDefinitions first
            "htv:methodName":"POST", // This is the default for this Thing. Even a property read would be with POST unless otherwise specified
            "op":"writeproperty",
            "reusable": false // to be discussed. Can be deduced from binding
        },
        "basichttp2" : {
            "base":"basichttp1",
            "htv:methodName":"PUT",
            "op":"readproperty"
        },
        "broker" : {
            "href": "mqtt://www.w3.org/2019/wot/broker",
            "contentType": "text/plain",
            "security":"no_sc"
            // for how long can the connection be reused?
        }
    },
    "title": "test",
    "securityDefinitions": { // should these be also embedded into connections?
        "no_sec": {
            "scheme": "nosec"
        },
        "basic_sc":{
            "scheme": "basic"
        }
    },
    "security": "no_sec", // it is probably not needed anymore -> Should we say that if there is connections element, security and base are not allowed?
    "properties": {
      "prop1": {
           "type":"string",
            "forms": [
                {
                   "connection": "broker",
                   "op": "readproperty",
                   "mqv:topic": "application/devices/thing1/program/commands/reset",
                   "reusable": true,
                }
            ]
        },
        "prop2": {
            "type":"string",
            "forms": [
                {
                    "base": "basichttp2",
                    "href": "myDevice/properties/prop2",
                    "htv:methodName":"GET"
                },
                {
                    "base": "basichttp1",
                    "href": "myDevice/properties/prop2"
                    // default is POST
                }
            ]
        }
    }
}
```

##### Ege: Putting Containers Together

```js
{
    "commonDefinitions":{ // Name to be decided
      "connectionDefinitions": {  // Name to be decided
          "basichttp1" : {
              "href": "https://example.com", // usual base URI
              "contentType": "application/cbor", // This is the default for this Thing's forms
              "security":["basic_sc"], // must be defined in securityDefinitions first
              "htv:methodName":"POST", // This is the default for this Thing. Even a property read would be with POST unless otherwise specified
              "op":"writeproperty"
          },
          "basichttp2" : {
              "connection":"basichttp1", //
              "htv:methodName":"PUT",
              "op":"readproperty"
          },
          "broker" : {
              "href": "mqtt://www.w3.org/2019/wot/broker",
              "contentType": "text/plain",
              "security":"no_sc"
          }
      },
      "securityDefinitions": { // should these be also embedded into connections?
          "no_sec": {
              "scheme": "nosec"
          },
          "basic_sc":{
              "scheme": "basic"
          }
      },
      "schemaDefinitions": {
        "schema1":{"type":"string"}
      }
    }
    "title": "test",
    "security": "no_sec", // is this needed with the connection containing the security term?
    "connection":"basichttp1",
    "properties": {
      "prop1": {
           "type":"string",
            "forms": [
                {
                   "connection": "broker",
                   "op": "readproperty",
                   "mqv:topic": "application/devices/thing1/program/commands/reset",
                   "reusable": true,
                   "additionalResponses":{
                     "schema":"schema1",
                   }
                }
            ]
        },
        "prop2": {
            "type":"string",
            "forms": [
                {
                    "base": "basichttp2",
                    "href": "myDevice/properties/prop2",
                    "htv:methodName":"GET"
                },
                {
                    "base": "basichttp1",
                    "href": "myDevice/properties/prop2"
                    // default is POST
                }
            ]
        }
    }
}
```

### Data Schema Mapping

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/data%20mapping)

Also known as: Mapping TD elements to messages

- Some protocols have a main channel and auxiliary/ancillary/side channels to exchange information, e.g HTTP has Headers, URI-Variables, Payload/Body.
- Some protocols may have a default/unique `contentType` for at least one of the channels, others are fixed or flexible. e.g. HTTP Headers are key-value strings, Modbus uses only boolean and 16bit quantities.
- Some protocols do not have the concept of `contentType` at all.
- Some `contentType` may be more expressive than our DataSchema, e.g. CBOR [Maps with integer keys](https://www.rfc-editor.org/rfc/rfc8949.html#map-keys).

#### Open questions

- How can we describe how the logical information (state for property, input/output messages for actions, messages for event) is mapped to each channel?
- Do we need to reconsider how we express `contentType` and `contentCoding` in the case more than a channel allows flexible data formats?
- Do we want to provide a way to express a serialization scheme for protocols that have only inflexible (e.g. binary-only) channels, without going through the route of declaring a `contentType`?
- Do we want to provide a way to express a serialization scheme between our DataSchema and richer contentTypes (e.g XML, CBOR)?

#### Related Issues:

- [BACnet URI Variables discussion](https://github.com/w3c/wot-binding-templates/issues/302)
- [Complex data types in simple protocols](https://github.com/w3c/wot-thing-description/issues/1936)
- [jsonrpc-over-websocket](https://github.com/w3c/wot-binding-templates/issues/125)
- [xml binding discussion](https://github.com/w3c/wot-binding-templates/issues/139)
- [cbor analysis](https://github.com/w3c/wot-binding-templates/issues/8)
- [initial issue with this](https://github.com/w3c/wot-binding-templates/issues/219)
- [aka payload pattern](https://github.com/w3c/wot-thing-description/issues/1217)
- [HTTP Headers in directory exploration (Problem 2)](https://github.com/eclipse-thingweb/node-wot/issues/1221)

### Security Schemes Refactoring

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/Security) ![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/Binding)

The need to be refactored and use the same pattern as other reusable elements

Relevant discussions:

- https://github.com/w3c/wot-thing-description/issues/1394

### Inline Security

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/Security) ![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/reusable%20elements)

Simplifying the way to describe security when there is only one mechanism needed to be described (in contrast to needing two terms at the moment)

Relevant discussions:

- https://github.com/w3c/wot-thing-description/pull/945

### Reusable Element Design

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/Security)

Scenarios, requirements, and use the same pattern for all reusable elements.
This will influence the items above.

Related discussions:

- https://github.com/w3c/wot-thing-description/pull/1341 (but many are linked here as well)

## Affordance Uniformity

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/affordance%20uniformity)

Uniform pattern/state machines between Actions, Events, and Properties.

- Avoid doing the same thing in a different way, for example how to express observability and cancellation
- Relationships across affordances, for example when an Action changes the state of a Property
- Property vs. Action (also URI Variables redesign question)

## Normative Parsing, Validation, Consumption

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/Validation)

Currently, the TD specification defines an abstract information model and a default JSON serialization for TDs.
However, parsing, consuming and validating TDs are not normatively defined.
A validation process is defined but is not normative, which leads to certain ambiguities for a Consumer parsing a TD.
Additionally, no method is proposed for validation of the extensions that are used via the prefixes and the @context.
The WG will specify normative algorithms for parsing, consuming and validating TDs to ensure interoperability of Consumers.

### TD Validation

What is a valid TD, are there any levels of validness?

- A TD validator can do only JSON Schema validation but that is not enough to test everything.
- A TD may be not completely valid but usable by a "degraded consumer" (see below) or a TD can be completely valid according to all the assertions and protocol bindings but not be usable by some consumers.

Additionally, we need better validation of protocols and associated security in the TD.

### Consumption Rules

Do we want to prescribe how TDs are processed and consumed beyond the text level?

### Degraded Consumption

- Rule for uniform degradation across consumers, e.g. TD too big, protocol or protocol options unknown, contentType unknown, etc.
