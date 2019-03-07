# WoT Thing Description (TD) Explainer

## What role does TD specification play in WoT?



The Thing Description (TD) specification is attempting to address the interoperability between Things (and applications that use Things) in how Things manifest their *Interaction Affordance* (i.e. properties, actions and events) to clients, using Web technologies such as Hypermedia controls (links, forms, etc.) and Media Types.  

With TD, the clients are informed of the choice to make in interacting with the Things and drive applications just as Web HTML pages let users to make choices in navigating the Web and drive Web applications through links and forms.

Through PlugFest activities in WoT Interest Group, the group learned that essentially such a manifest has to serve to answer questions such as the ones shown in the below figure. The WoT Working Group formalized this concept, and gave it the name Thing Description (TD) .

![explainer_how_to_interact](explainer_how_to_interact.png)

Below shows a figure borrowed from WoT Architecture document, showing the entire WoT building blocks. Each building block is concerned with addressing one of the four aspects of interoperability issues identified in the scope of the WoT WG's work for the current charter. 

As mentioned above, TD is about how to describe *Interaction Affordance*s of Things. Other building blocks are:

-  *Application behavior* that implements Application logic and manages Thing's lifecycle. *WoT Scripting API* provides a JavaScript programming interface as a way to ease developer's work of implementing *Application behavior*. 
- *Security Configuration* that describes security schemes required to access a Thing. Well-established security schemes are directly supported as part of the core *Thing Description* vocabulary. Other security schemes can be supported as extensions. 
- *Protocol Binding Templates* that describes how concrete protocols are mapped to abstract terms defined in *Thing Description* specification.![WoT Building Blocks](https://cdn.staticaly.com/gh/w3c/wot-architecture/ce8a2b8624ffd60d913cd7aa2d36ad321e605ed7/images/wot-building-blocks.png)

## What does TD contribute to IoT Interoperability? 

IoT connectivity frameworks such as *IIC (Industry Internet Consortium) connectivity stack*, have an hourglass shape, and the network layer (i.e. IP - Internet Protocol) is called a narrow waist, therein IP serves as a focal point where diverse lower level networking protocols are bound to IP, and all the upper layer can depend on IP regardless what lower networking protocols are actually used underneath. This hourglass model is generally considered a significant contributing factor in the success of the internet.

When we think about the situation where many IoT ecosystems are developed in silos, there is a need for a narrow-waist architecture for IoT ecosystem interoperability in order to avoid ending up in N-times-N translation gateway solution where N is the number of IoT ecosystems involved. This is a serious problem in building cross industry domain application in which each domain likely is using an ecosystem unique to the industry domain. 

Thing Description (TD) attempts bring an order to this IoT ecosystem fragmentation and address the interoperability issue by positioning itself as the narrow waist of the new hourglass interoperability architecture for IoT ecosystems. 

In the figure below, even though IoT ecosystems employs different protocols, payloads and security schemes, TD provides a common description system where the uniqueness of each ecosystem can be described in the same TD format. Therefore, cross-domain applications that spans across multiple ecosystems can be developed by interacting with ecosystems according to the description given in the TDs regardless of the number of ecosystems involved.

Applications, on the other hand, often use different terminologies in their data models. This again tend to end up in N-times-N translation between data models when those applications want to talk to each other. Semantic Web technology is known to help address this issue. TD embraces Semantic Web technologies by allowing semantic annotations to various elements in TD instances, enabling applications to understand other applications data by applying semantic processing.

![explainer_wot_hourglass](explainer_wot_hourglass.png)

## Goals of Thing Description (TD) 

According to the WoT Working Group [Charter](https://www.w3.org/2016/12/wot-wg-2016.html), the goals of Thing Description (TD) is:

- The Working Group will develop solutions to describe Things through metadata and declarations of their capabilities (e.g., possible interactions). 
- TD specification includes the definition of *machine-understandable vocabulary sets* as well as serialization formats, where the vocabulary sets include:
  - A common vocabulary for describing Things in terms of the data and interaction models they 
    expose to and/or consume from applications (e.g., interaction patterns such as Properties, Actions, and Events)
  - A common vocabulary for security and privacy metadata as a basis for platforms to determine how to securely interoperate.
  - A common vocabulary for communications metadata. 

At the same time, TD has to pay attention to the following requirements. 

- For basic usages there will not be an explicit dependence on RDF and it will not be necessary for constrained systems to perform explicit semantic processing.
-  To enable more complex usages, the TD will include extension points to allow the use of semantic vocabularies and tools (e.g., Linked Open Data, Schema.org, Resource Description Framework (RDF), semantic reasoners, etc..).

### Non-Goals of Thing Description (TD)

- Application- and domain-specific metadata vocabularies.
- Modification of existing protocols.



