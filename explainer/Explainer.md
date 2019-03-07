# WoT Thing Description (TD) Explainer

## What role does TD specification play in WoT?



The Thing Description (TD) specification is attempting to address the interoperability between Things (and applications that use Things) in how Things manifest their *Interaction Affordance* (i.e. properties, actions and events) to clients, using Web technologies such as Hypermedia controls (links, forms, etc.) and Media Types.  

With TD, the clients are informed of the choice to make in interacting with the Things and drive applications just as Web HTML pages let users to make choices in navigating the Web and drive Web applications through links and forms.

Through PlugFest activities in WoT Interest Group, the group learned that essentially such a manifest has to serve to answer questions such as the ones shown in the below figure. The WoT Working Group formalized this concept, and gave it the name Thing Description (TD) .

![explainer_how_to_interact](C:\My_Programs\WoT\wot-thing-description\explainer\explainer_how_to_interact.png)

Below shows a figure borrowed from WoT Architecture document, showing the entire WoT building blocks. Each building block is concerned with addressing one of the four aspects of interoperability issues identified in the scope of the WoT WG's work for the current charter. 

As mentioned above, TD is about how to describe *Interaction Affordance*s of Things. Other building blocks are:

-  *Application behavior* that implements Application logic and manages Thing's lifecycle. *WoT Scripting API* provides a JavaScript programming interface as a way to ease developer's work of implementing *Application behavior*. 
- *Security Configuration* that describes security schemes required to access a Thing. Well-established security schemes are directly supported as part of the core *Thing Description* vocabulary. Other security schemes can be supported as extensions. 
- *Protocol Binding Templates* that describes how concrete protocols are mapped to abstract terms defined in *Thing Description* specification.![WoT Building Blocks](https://cdn.staticaly.com/gh/w3c/wot-architecture/ce8a2b8624ffd60d913cd7aa2d36ad321e605ed7/images/wot-building-blocks.png)

## Description

Narrow Waist in Systems Design
