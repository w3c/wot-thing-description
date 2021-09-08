# Yet another Action Model

This proposal wants to overcame problems around the other proposals of a new hypermedia action model. In particular, it
should address the following concerns:
- It leverage on a static representation of the hypermedia actions (No dynamic changes to the Thing Description) 
- It implicitly describes how IDs should be used between each new operation types

Basically, the idea is to employ Thing Models as means to describe dynamically created Action Resources. Those Action Resources
will have a Description conformant to the Thing Model provider. For further investigation refer to the [slide deck](./yetAnotherActionModel.odp) of this folder.

It has been found to have the following advantages:
- No id tracking 
- Statically describe Action Request operations thanks to the TM
- Backward compatible
- Flexible (it covers green field and brown filed devices). it might as well be used for other use cases: used in properties it might describes operations that can be performed on collections of Web Things (to be verified)
- As a side effect we get the ability to specify a TM as a validation parameter of affordances (w3c/wot-discovery#182)
- Compact: it does not add too many new parameters
- Lightweight: Consumers of a particular profile can just use the model reference as a tag and process the returned object according to their specification.  


Open questions are:
- How to handle different consumers? What if another consumer wants to shutdown a previously created action?
- Action queues still need to be described by new operation types
- Model term may be moved up and placed at the affornace level
- Further validation with different API.
