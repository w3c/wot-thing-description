# WoT Thing Description (TD) 1.1 Explainer (DRAFT - WIP)
This is an updated version of the [Explainer for TD 1.0](Explainer.md).


## What's All This About?

[//]: # (What role does the TD specification play in the WoT?)

[//]: # (A brief, 4-5 paragraph explanation of the feature’s value. Outline what the feature does and how it accomplishes those goals in prose. If your feature creates UI, this is a great place to show mocks and user flows.)

[//]: # (The W3C Web of Things [WoT] is intended to enable
interoperability across IoT Platforms and application domains using Web technology.)

In the [WoT Architecture](https://w3c.github.io/wot-architecture/index.html), 
a Thing is defined as an abstraction of a physical IoT device such as a sensor (temperature, CO2, ...), an actuator (lamp, motor, ...), or a service like a weather service. The Thing Description (TD) provides descriptive metadata for a Thing's interface.


With a TD, clients are informed of the choices they can make when interacting with Things such reading a temperature value or switching on a lamp. This can drive applications in the same way that Web HTML pages allow users to
make choices when navigating the Web and drive Web applications
through links and forms. Therefore, the TD can be also seen as the ‘index.html’ for Things. The TD itself is serialized in JSON-LD 1.1. 

TDs are designed to provide all the information needed to interact with a Thing. Specifically, it provides answers to questions like those shown in the following figure.


![How to Interact with IoT Devices](images/explainer_td.png)


## Getting started

Lets assume there is a smart lamp that offers an interface with following characteristics:

| |  ||  
--- | --- |  --- |
|Name|MyLampThing| 
|Protocol |HTTPS| 
|Security |Basic authentication| 
|Local server address |192.168.2.134| 
|Content type |application/json| 
|Data / function offerings: |status (type: string) | Resource (GET): /status
|  |toggle | Resource (POST): /toggle
|  |overheating (type: string) | Resource (GET & longpoll): /oh


Based on such information a Thing Description can be simple designed in the following way

```json
{
    "@context": "https://www.w3.org/2022/wot/td/v1.1",
    "title": "MyLampThing",
    "securityDefinitions": {
        "basic_sc": {"scheme": "basic", "in": "header"}
    },
    "security": "basic_sc",
    "properties": {
        "status": {
            "type": "string",
            "forms": [{"href": "https://192.168.2.134/status"}]
        }
    },
    "actions": {
        "toggle": {
            "forms": [{"href": "https://192.168.2.134/toggle"}]
        }
    },
    "events":{
        "overheating":{
            "data": {"type": "string"},
            "forms": [{
                "href": "https://192.168.2.134/oh",
                "subprotocol": "longpoll"
            }]
        }
    }
}
```

Before going in detail an important paradigm is explained that is defined by the [WoT Architecture](https://w3c.github.io/wot-architecture/index.html), namely about the interaction affordances **properties, actions**, and **events**. 

Each Thing and its data and functions offerings that is possible via the interface can be classified in those affordances. Sensor and/or parameter data are considered as **properties**. Functions like on/off, dimming, etc. are seen as **actions**. Data events, streams etc.  are considered as **events**. 

In this context, the MyLampThing example above would result in declaring status a property, toggling an action, and overheating an event. 

Now, by reading the above example TD,  one can obtain knowledge about the Thing named `MyLampThing`, including the following:

- The Thing requires the use of HTTP Basic Authentication when 
  accessing all interaction resources (announced by securityDefinitions and security).
- The Thing provides one Property interaction resource with the name `status`.
  - The property `status` is accessible via the HTTP protocol
    with a GET method at URI `https://192.168.2.134/status`.
  - Reading the property `status` will return a string value.
- The Thing provides one Action interaction resource with the name `toggle`. 
  - The action `toggle` is accessible via the HTTP protocol
    with a POST method at URI `https://192.168.2.134/toggle`.
- The Thing provides one Event interaction resource with the name `overheating`.
  - The event `overheating` can be obtained at URI 
    `https://192.168.2.134/oh` by using HTTP with a long polling subprotocol.
    The subprotocol clarifies which of several possible mechanisms in HTTP
    are used to provide "push" notifications.
  - Each message pushed by the Thing is a string value.


## What you can do with a Thing Description (TD)?

Based on such information in a TD a WoT stack such as designed based on the [W3C Web of Things Scripting API](https://w3c.github.io/wot-scripting-api/) can simple interpret the TD content and abstract all the communication details. Developer just working with the **properties, actions**, and **events** paradigm and do not need to take care protocol specifics such as the HTTP method, the resource address, port number, etc.. The following video gives an inside about this aspect:

[![IMAGE ALT TEXT](http://img.youtube.com/vi/lt_P2BU8e3I/0.jpg)](http://www.youtube.com/watch?v=lt_P2BU8e3I "TD usage with a programming API")

This example also shows that TDs can be used to easily onboard Things into any IoT ecosystems (e.g., IoT cloud services, edge systems, etc.). TDs helps to understand what the Things offers and how the offered data and functions can be bound to applications processes (e.g., creating service mash-ups, dashboards, etc.). The following example shows how TD are used in a node-red application:

[![IMAGE ALT TEXT](http://img.youtube.com/vi/oAcYbJ6P9bU/0.jpg)](http://www.youtube.com/watch?v=oAcYbJ6P9bU "TD usage in node-red")

TD also helps to mange your IoT system that typically consist of a heterogeneous device landscape based on different vendors and technologies that are used (e.g., HTTP, MQTT, Modbus, etc). Directories can be used to manage the TDs (e.g., create, search, etc). [The W3C WoT Discovery](https://w3c.github.io/wot-discovery/) provides details about a standardized how the interface of such directories can look like.  


## What else is possible with the Thing Description specification?
Besides the definitions of how a Thing description should be designed, there are other features provided around the TD, such as the TD context extensions and Thing Model definitions. 


### TD Context Extensions
Through JSON-LD serialization, the WoT Thing Description provides the ability to add context knowledge from additional namespaces. This mechanism can be used to enrich the Thing Description instances with additional (e.g., domain-specific) semantics. It can also be used to import additional Protocol Bindings or new security schemes in the future. 

 The following TD extends the TD above by introducing a second definition in the @context to declare the prefix saref as referring to SAREF. This IoT ontology includes terms interpreted as semantic labels that can be set as values of the @type field, giving the semantics of Things and their interaction affordances. In the example below, the Thing is labelled with saref:LightSwitch, the status Property is labelled with saref:OnOffState and the toggle Action with saref:ToggleCommand.

 ```json
{
    "@context": [
        "https://www.w3.org/2022/wot/td/v1.1",
        { "saref": "https://w3id.org/saref#" }
    ],
    "title": "MyLampThing",
    "@type": "saref:LightSwitch",
    "securityDefinitions": {
        "basic_sc": {"scheme": "basic", "in": "header"}
    },
    "security": "basic_sc",
    "properties": {
        "status": {
            "@type": "saref:OnOffState",
            "type": "string",
            "forms": [{
                "href": "https://192.168.2.134/status"
            }]
        }
    },
    "actions": {
        "toggle": {
            "@type": "saref:ToggleCommand",
            "forms": [{
                "href": "https://192.168.2.134/toggle"
            }]
        }
    },
    "events": {
        "overheating": {
            "data": {"type": "string"},
            "forms": [{
                "href": "https://192.168.2.134/oh"
            }]
        }
    }
}
```
### Thing Model definition
One of the main intentions of a Thing Description is to provide a Consumer with all the details necessary to successfully interact with a Thing. In some IoT application scenarios, a fully detailed Thing Description, e.g., with communication metadata is not necessary (e.g., IoT ecosystems may implicitly handle communication separately), or may not be available because a new entity has not yet been deployed (e.g., IP address is not yet known). Sometimes, also a kind of class definition is required that forces capability definitions that should be available for all created instances (e.g., large-scale production of new devices).

In order to address the above-mentioned scenarios or others, the Thing Model can be used that mainly provides the data model definitions within Things' Properties, Actions, and/or Events and can be potentially used as template for creating Thing Description instances. In the following a sample Thing Model is presented that can be seen as a model for the Thing Description instance in the first TD example above.

```json
{
    "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
    "@type" : "tm:ThingModel",
    "title": "Lamp Thing Model",
    "properties": {
        "status": {
            "description": "current status of the lamp (on|off)",
            "type": "string",
            "readOnly": true
        }
    },
    "actions": {
        "toggle": {
            "description": "Turn the lamp on or off"
        }
    },
    "events": {
        "overheating": {
            "description": "Lamp reaches a critical temperature (overheating)",
            "data": {"type": "string"}
        }
    }
}
```
Thing Model definitions are identified by the "@type": "tm:ThingModel". As the example shows, it does not provide details about a single Thing instance due to the lack of communication and security metadata. This specification presents a mechanism for deriving valid Thing Description instances from such Thing Model definitions. In addition, other design concepts are specified, including how to override, extend, and reuse existing Thing Model definitions. 



## Non-Goals of Thing Description (TD)

The following are explictly NOT goals of the TD specification:

- Application- and domain-specific metadata vocabularies.
   - TDs support the use of domain-specific vocabularies,
     but no domain-specific vocabularies are defined as part of the specification.
- Modification of existing protocols or security mechanisms.
- Specifications of new protocols or security mechanisms.
   - TDs are meant to describe existing practice, not prescribe new practices.

TDs are also limited to protocols that have resources and access points that can
be described with URLs and to payload types that have an IANA media Type.
Structured payloads are supported but should be
conceptually interconvertible with JSON.


## Differentiation to Thing Description 1.0
The main difference of this new specification from Thing Description 1.0 is that it includes the Thing Model concept (see above). This was only discussed in the Annex of the Thing Description 1.0 and was called Thing Description Template that time. 

A new features is also possible to signalize that a Thing is following a specific profile such as the [W3C WoT Core Profile](https://w3c.github.io/wot-profile/). 

In general, TD 1.1 specification describes a superset of the features defined in Thing Description 1.0. The new minor version update is also used to redefine some features more clearly and to add additional examples to make it easier to understand. 

The complete change log with the new features and refinements can be found in the [change log section](https://w3c.github.io/wot-thing-description/#changes). 




## Implementations

Implementations were built by
Bosch, Smart Things, ERCIM, Hitachi, Intel, Oracle, Panasonic, Fujitsu and Siemens (**list needs to be updated**).
The latest list of implementations can be found in the [implementation report](https://w3c.github.io/wot-thing-description/testing/report11.html) or in the [developer space](https://www.w3.org/WoT/developers/) at the W3C WoT main page. 

## Related Work
There are already several service description languages on the market.
However, most of them do not focus on IoT application cases and do not
support IoT-based protocols like MQTT, CoAP, Modbus, etc.
In addition, the alignment of a semantic approach is also missing to
enable the reuse of existing domain usages and to increase interoperability
in IoT scenarios.
In the following, well-known service description languages are listed:

* WSDL: Around 15 years ago, [WSDL](https://www.w3.org/TR/wsdl20/) 
  was quite popular to describe SOAP based web services and to realize
  SOA-based architectures.
  One of the strength (however, which is also a weakness),
  is the rich set of WS-* add-ons such as for semantic, security,
  and notification mechanisms.
  The data model that can be exchanged between server and client
  can be designed via XML Schema definitions.
  Today, WSDL is no longer a preferred technology.
  One of the reasons is the complex implementation of WSDL based web services
  (especially on the client side),
  the limitation to SOAP/XML messaging and the usage of HTTP protocol only.
  In addition, the huge WS-* opportunities,
  which contain redundant concepts, often led to incompatible implementations.
  Another downside is that there is a huge effort when the content of the
  WSDL is slightly changed.
  All client implementations (typically stubs and skeletons) have to be
  newly generated and compiled.

* OpenAPI/SWAGGER: [OpenAPI](https://swagger.io/) specification is one of
  the most popular web interface descriptions on the market.
  Mainly, this solution is used to describe REST/HTTP based APIs interfaces
  with JSON messaging.
  JSON Schema is used to describe the data model.
  OpenAPI has a huge community and provides a rich set of tools and libraries
  for different kinds of platforms.
  One of drawbacks of OpenAPI is the non-support of standard semantic annotations
  and the (re-)usage of domain knowledge (e.g., iotschema.org).
  Interface descriptions via OpenAPI are mainly designed for humans and have to
  interpreted by humans (if possible).
  Machine interpretation and a semantic-based discovery/querying are out of scope.
  Another drawback is the limitation to HTTP protocols.
  MQTT, CoAP, OPC UA etc. are not covered.

* RAML: The purpose of the RESTful API Modeling Language ([RAML](https://raml.org/))
  is very similar to that of OpenAPI,
  as it is mainly intended to develop REST/HTTP-based APIs.
  In contrast to OpenAPI,
  RAML offers more flexibility in terms of including and reusage of external code
  and schema definitions such as XML Schema.
  Similar to OpenAPI,
  there is a lack of standardized semantic support without a query/discovery mechanism
  as well as the limitation to the HTTP protocol.

* Electronic Device Description Language (EDDL): EDDL is an IEC standard ([IEC 61804-3](https://webstore.iec.ch/publication/60628)) for describing the communication characteristics of the field devices and its parameters such as device status, diagnostic data, and configuration details for an operating system and human machine
interface (HMI) environment. Initially EDDL was developed in 1992 for use as part of the HART Communication Protocol and was adopted into the Foundation fieldbus and Profibus standards in 1994. Today, EDDL is mainly used in the process automation domain with appropriate tools to generate an interpretative code to support parameter handling, operation, and monitoring of automation system components (e.g., remote I/Os, controllers, sensors).
