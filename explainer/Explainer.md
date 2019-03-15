# WoT Thing Description (TD) Explainer

## What role does the TD specification play in the WoT?

The Thing Description (TD) provides descriptive metadata for a Thing,
where a Thing is an abstraction of an IoT device or service.
TDs supports interoperability between Things (and applications that use Things) by describing
how Things manifest their *Interaction Affordances* (i.e. properties, actions and events) to clients,
using Web technologies such as Hypermedia controls (links, forms, etc.) and Media Types.

With a TD, clients are informed of the choices they can make when interacting with Things.
This can drive applications in the same way that Web HTML pages allow users to 
make choices when navigating the Web and drive Web applications through links and forms.

Through PlugFest activities in the WoT Interest Group, the group learned that such a manifest has 
to answer questions such as the ones shown in the figure below. 
The WoT Working Group formalized the TD concept in the current specification.

![explainer_how_to_interact](explainer_how_to_interact.png)

Below shows a figure borrowed from the WoT Architecture document showing the WoT building blocks and
how they relate to four key architectural aspects of a Thing.
Each building block is concerned with addressing specific interoperability issues identified 
in the WoT WG's charter.

![WoT Building Blocks](https://w3c.github.io/wot-architecture/images/wot-thing-with-scripting.png)

As mentioned above, TDs provide the *Interaction Affordances* of Things, along with other
metadata, such as the name, description, and optionally semantic annotations for a Thing. 
TDs also consolidate public security metadata and payload data schemas. 
TD generally enable interoperability at the network interaction level.

Other building blocks that address other interoperability challenges are:
- The *WoT Scripting API* provides a JavaScript programming interface as a way to ease developer's work of implementing *Application behavior*.  It also provides a convenient way to produce and "Expose" Thing Descriptions as well as read and parse ("Consume") other Thing's Thing Descriptions. 
- *Security* is another key building block, but is also a cross-cutting concern.  
  TDs consolidate the public metadata that describes the security mechanisms and other requirements necessary to access a Thing. 
  Well-established security schemes are directly supported as part of the core *Thing Description* vocabulary. 
  Additional security schemes can be supported as extensions. 
- *Protocol Binding Templates* describes how concrete protocols are mapped to abstract terms defined in *Thing Description* specification.

## How does TD contribute to IoT Interoperability? 

In the modern internet the IP standard, the Internet Protocol, forms what is called a "narrow waist". 
IP serves as a focal point where diverse lower level networking protocols are built on top of, or can be converted to, IP, 
and all upper layers can depend on IP regardless what lower level physical point-to-point protocols are actually being used 
underneath. 
At the application level, the combination of HTML and HTTP likewise provides a narrow waist for
a myriad of different applications, both M2H (browsers and web pages) and M2M (web services).
This hourglass model is generally considered a significant contributing factor in the success of both the web and the internet.

![Web_and_Internet_Hourglass](web_and_internet_hourglass.png)

In IoT many IoT ecosystems have been developed in silos.
Currently each domain is likely is using a standards unique to that industry domain and ecosystem. 
Even worse, many IoT devices already deployed cannot be easily converted to a different standard,
even if everyone agreed to one - this is known as the brownfield problem.
This fragmentation is a serious problem in building cross industry domain IoT applications. 

There is a corresponding need for a narrow-waist architecture for IoT ecosystem interoperability. 
Such a narrow waist would avoid requiring N^2 peer-to-peer translations
(where N is the number of IoT ecosystems involved). 

![IoT_Hourglass](iot_hourglass.png)

The Thing Description (TD) addresses the IoT ecosystem fragmentation problem
not by defining yet another standard that everyone has to convert to,
but by providing a common metadata framework and set of semantic abstractions.
It also builds upon web standards such as URLs, IANA media types, and JSON.
The TD can address the IoT interoperability issue by providing a narrow waist
at the level of metadata, supporting an interoperability architecture for the IoT
even when IoT systems are built using devices using multiple protocols.

In the figure below, even though IoT ecosystems employs different protocols,
payloads and security schemes, the TD provides a common description.
The unique features of each ecosystem can be described in the same TD format.
Cross-domain applications that span multiple ecosystems can be developed by
interacting with devices according to the description given in the TDs,
regardless of the number of ecosystems involved.

Applications also often use different terminologies in their data models.
This again tends to lead to an N-times-N translation cost between data models
when those applications want to talk to each other.
Semantic Web technology can be used to address this issue.
TDs embrace Semantic Web technologies.
Semantic annotations can be added to various elements in TD instances,
enabling applications to understand other applications' data by applying
semantic processing.

![explainer_wot_hourglass](explainer_wot_hourglass.png)

## Goals of Thing Description (TD) 

According to the WoT Working Group [Charter](https://www.w3.org/2016/12/wot-wg-2016.html), 
the goals of the Thing Description (TD) are to:

- describe Things through metadata and declarations of their capabilities (e.g., possible interactions); and
- include the definition of *machine-understandable vocabulary sets*, where the vocabulary sets include:
  - a common vocabulary for describing Things in terms of the data and interaction models they 
    expose to and/or consume from applications (e.g., interaction patterns such as Properties, Actions, and Events);
  - a common vocabulary for security and privacy metadata as a basis for platforms to determine how to securely interoperate; and
  - a common vocabulary for communications metadata. 

At the same time, the TD has to pay attention to the following requirements:

- For basic usages there must not be an explicit dependence on RDF, 
  so it will not be necessary for constrained systems to perform explicit semantic processing.
- To enable more complex usages, 
  the TD must include extension points to allow the use of semantic vocabularies and tools 
  (e.g., Linked Open Data, Schema.org, Resource Description Framework (RDF), semantic reasoners, etc..).

These goals are naturally somewhat in conflict, but as will
be described, the specification attempts to address them by providing a core
functionality that does not require RDF.  
However, TDs still support (optional) semantic annotations and simple integration into RDF systems.

### Non-Goals of Thing Description (TD)

- Application- and domain-specific metadata vocabularies.
   - TDs support the use of domain-specific vocabularies,
     but no domain-specific vocabularies are defined as part of the specification.
- Modification of existing protocols or security mechanisms.
- Specification on new protocols or security mechanisms.
   - TDs are meant to describe existing practice, not prescribe new practices.

TDs are also limited to protocols that have resources and access points that can
be described with URLs and to payload types that have an IANA media Type.
Structured payloads are supported but should be conceptually interconvertible with JSON.

## What is inside the Thing Description (TD) specification

The TD draft specification is available for review [here](https://w3c.github.io/wot-thing-description/).

The specification primarily defines the TD Information Model and the TD Serialization as JSON:

- **[TD Information Model](https://w3c.github.io/wot-thing-description/#sec-vocabulary-definition)** (Section 5)

  The Thing Description Information model serves as the conceptual basis for the serialization and processing of a Thing Description. 
  It consists of the four vocabularies listed below. 

  - [**Core Vocabulary**](https://w3c.github.io/wot-thing-description/#sec-core-vocabulary-definition)

    TD Information Model's core vocabulary includes terms for: 
      - *[Thing](https://w3c.github.io/wot-thing-description/#thing)*, 
      - *[Interaction Affordance](https://w3c.github.io/wot-thing-description/#interactionaffordance)*, 
      - *[Form](https://w3c.github.io/wot-thing-description/#form)*, 
      - *[Version Information](https://w3c.github.io/wot-thing-description/#versioninfo)*, 
      - *[Expected Response](https://w3c.github.io/wot-thing-description/#expectedresponse)* (media type of response messages), 
      - *[Multi Language](https://w3c.github.io/wot-thing-description/#multilanguage)* (Container to provide human-readable text in different languages).
  - [**Data Schema Vocabulary**](https://w3c.github.io/wot-thing-description/#sec-data-schema-vocabulary-definition)
      - Vocabulary for Data Schema Definitions of both scalar and structured payload data.
  - [**Security Vocabulary**](https://w3c.github.io/wot-thing-description/#sec-security-vocabulary-definition)
      - Vocabulary of well-established security mechanisms considered appropriate to be built-in in TD Information Model.
  - [**Web Linking Vocabulary**](https://w3c.github.io/wot-thing-description/#sec-web-linking-vocabulary-definition)
      - Vocabulary for Web links exposed by a Thing. 
      - The Web Linking Vocabulary, modeled after the CoRE Link format, is in its own namespace for modularity.

The TD Information Model borrows two keywords from JSON-LD, `@context` and `@type`,
as extension points in order to allow the use of semantic vocabularies and tools.

- **[TD Serialization](https://w3c.github.io/wot-thing-description/#sec-td-serialization)** (Section 6)
   - Describes the serialization of instances of TD Information Model.
   - Serialization of TD is in JSON. 
   - There is an (informative) [JSON Schema](https://w3c.github.io/wot-thing-description/#json-schema-4-validation) 
     provided for TD serialization that can be used for validating TD instances.

In light of the Open-World assumption used by RDF, and to allow TDs to be easily converted to RDF and support extensions,
TD Serialization defines a two classes of TD serialization, the "Simple Thing Description" and the "Full Thing Description". 
The Full Thing Description instances carry all mandatory vocabulary terms in the instances 
(i.e. values are present even when there are default values defined in TD specification.) 
Therefore, a Full Thing Description instance at least contains @context at the [Thing](https://w3c.github.io/wot-thing-description/#sec-thing-as-a-whole-json) level.
In a Simple Thing Description elements with default values can be omitted, even if they are technically mandatory in the 
information model.

The Full Thing Description  enables semantic processing such as by RDF tools. 
The TD specification also defines its own [Transformation to JSON-LD & RDF](https://w3c.github.io/wot-thing-description/#note-jsonld10-processing) 
rules (in an Appendix) for transforming TD instances into a form (JSON-LD 1.0 & RDF) 
adequate for feeding into semantic processing tools.
The syntax of the TD is also aligned with the current JSON-LD 1.1 draft but cannot
be considered a JSON-LD 1.1 document as that standard is not yet final.

### What Else are There in Thing Description (TD) Specification?

TBD

## Important Design Choices

This section summarizes a number of design choices that the WoT Working Group spent a considerable amount of time debating.

TODO: See second point in WoT Architecture's explainer; should be moved here.

### TD Serialization's relationship to JSON-LD 1.1

The WoT Working Group has been talking with the JSON-LD WG
regarding missing features in JSON-LD 1.1 needed for implementation of the
current TD specification.
The discussion is ongoing in [GitHub](https://github.com/w3c/json-ld-api/issues/65).

In particular, while JSON-LD 1.1 supports the use of the same name in
different contexts as described in
[Scoped Context](https://w3c.github.io/json-ld-syntax/#scoped-contexts),
the WoT Working Group's understanding is that although the feature is helpful,
it still does not fully address what TD Serialization needs to support a
"natural" JSON serialization acceptable to web developers.
The issue essentially means that if the TD were treated as a JSON-LD 1.1 document,
it will not round-trip to the same TD in JSON-LD 1.1 format.

This is a problem in implementing common WoT use cases in which TDs are
stored in a Thing Directory in the form of RDF to allow for
semantics-based Thing discovery,
while TDs can be served from the Thing Directory in the form of TD after transforming back to the original form.

For this reason,
TD Serialization is in JSON format,
and it is not in JSON-LD 1.1 format.
If the requirements WoT Working Group presented to JSON-LD Working Group
are addressed and implemented in JSON-LD 1.1 draft specification as a stable feature,
the WoT WG will be able to say the TD conforms to JSON-LD 1.1 format.

### Communications Metadata

TD specification does not define communications metadata.
TD instances can use external vocabularies such as 
the [HTTP Vocabulary in RDF 1.0](https://www.w3.org/TR/HTTP-in-RDF10/)
to identify the methods and options in particular concrete protocols.
See more on the WoT WG Note [Web of Things (WoT) Protocol Binding Templates](https://w3c.github.io/wot-binding-templates/).

## Example

```
{
    "@context": [
        "http://w3.org/ns/td",
        { "saref": "https://w3id.org/saref#" },
        { "htv": "http://www.w3.org/2011/http#" }
    ],
    "@type": [ "Thing", "saref#LightingDevice" ],
    "id": "urn:dev:wot:com:example:servient:lamp",
    "name": "MyLampThing",
    "securityDefinitions": {
        "basic_sc": {"scheme": "basic", "in":"header"}
    },
    "security": ["basic_sc"],
    "properties": {
        "status" : {
            "@type": "saref#OnOffState",
            "readOnly": false,
            "writeOnly": false,
            "observable": false,
            "type": "string",
            "forms": [{
                "href": "https://mylamp.example.com/status",
                "contentType": "application/json",
                "htv:methodName": "GET",
                "op": "readproperty"
            }]
        }
    },
    "actions": {
        "toggle" : {
            "@type": "saref#ToggleCommand",
            "idempotent" : false,
            "safe" : false,
            "forms": [{
                "href": "https://mylamp.example.com/toggle",
                "contentType": "application/json"
                "htv:methodName": "POST",
                "op": "invokeaction"
            }]
        }
    },
    "events":{
        "overheating":{
            "data": {"type": "string"},
            "forms": [{
                "href": "https://mylamp.example.com/oh",
                "contentType": "application/json",
                "subprotocol": "longpoll",
                "op": "subscribeevent"
            }]
        }
    }
} 
```

By reading the above example TD, one can obtain knowledge about the Thing of name `MyLampThing` including the following:

- The Thing provides one Property interaction resource with the name `status`.
  - The property `status` is accessible via the HTTP protocol with a GET method at URI `https://mylamp.example.com/status`.
  - Reading the property `status` will return a string value.
  - The `status` property resource is an instance of the SAREF ontology's `OnOffState` class.
- The Thing provides one idempotent Action interaction resource with the name `toggle`. 
  - The action `toggle` is accessible via the HTTP protocol with a POST method at URI `https://mylamp.example.com/toggle`.
  - The `toggle` action resource is an an instance of the SAREF ontology's `ToggleCommand` class.
- The Thing provides one Event interaction resource with the name `overheating`.
  - The event `overheating` can be obtained at URI `https://mylamp.example.com/oh` by using HTTP with a long polling sub-protocol.
  - Each message pushed by the Thing is a string value.
- The Thing requires the use of HTTP Basic Authentication when accessing the above three interaction resources.

## Features at Risk

TBD


## Implementations

TBD

