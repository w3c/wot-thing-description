# W3C Web of Things (WoT)
## Responses to the W3C Security and Privacy Questionnaire

This document was prepared by the Web of Things (WoT) Working Group,
responding to the questions raised in the December 16, 2021 version of the 
[Self-Review Questionnaire: Security and Privacy](https://www.w3.org/TR/2021/NOTE-security-privacy-questionnaire-20211216)
document published by the W3C and required as part of both Security and Privacy
Wide Review processes.

These responses are related specifically to the 
[Web of Things (WoT) Thing Description](https://github.com/w3c/wot-thing-description) document.

In some cases a question needs to be considered with respect to another document:
* For the WoT system as a whole we include a set of responses associated with the
[Web of Things (WoT) Architecture](https://github.com/w3c/wot-architecture) document.
* The [Web of Things (WoT) Thing Description](https://github.com/w3c/wot-thing-description) 
specification is about a metadata information model 
and a file format expressing it, and fulfills a similar function to HTML. 
Responses related to the information model and the metadata encoding will be associated with this document.
* The [Web of Things (WoT) Discovery](https://github.com/w3c/wot-discovery) specification
describes how WoT Thing Descriptions are delivered to WoT Consumers, with WoT Consumers being
an analogue to browsers and WoT Discovery being an analogue to the HTTP protocol content delivery
mechanism.  
Responses related to content delivery will be associated with this document.
* There is also a [Web of Things (WoT) Profile](https://github.com/w3c/wot-profile) specification
describing constraints on certain WoT Implementations to improve interoperability.
Only when such constraints have a security impact they will be discussed in association with that
document.  Otherwise system satisfying a profile are special cases of the system
described in the other documents.

In the following we have used this mapping to interpret the various
questions, and so if a question or part of a question is relevant to content delivery
then it makes sense to consider it in whole or in part under Discovery, as opposed to
under Thing Description.

When appropriate we will cross-link our responses to responses associated with these other documents.

Please raise issues specific to specific documents on the appropriate issue tracker:
* [Web of Things (WoT) Architecture GitHub Issue page](https://github.com/w3c/wot-architecture/issues)
* [Web of Things (WoT) Thing Description GitHub Issue page](https://github.com/w3c/wot-thing-description/issues)
* [Web of Things (WoT) Discovery GitHub Issue page](https://github.com/w3c/wot-discovery/issues)
* [Web of Things (WoT) Profile GitHub Issue page](https://github.com/w3c/wot-profile/issues)

## Background

The [WoT Security and Privacy Considerations](https://github.com/w3c/wot-security) document
includes an extensive threat model,
and considers both passive and active attacks to
both data (payload transactions) and metadata (Thing Descriptions).
It should be made clear however that the WoT is _descriptive_.
WoT Thing Descriptions can be used to describe existing IoT devices.
In this case the WoT
is subject the same threats and mitigations as those devices.
For "new" devices written from scratch to conform to the WoT specifications,
we define a set of 
[WoT Security Best Practices](https://github.com/w3c/wot-security-best-practices)
which will be updated as necessary (for example, as the WoT is extended to new
IoT protocols or security schemes via its built-in extension mechanisms).
In addition, we define a general security testing procedure for WoT implementations in the
[WoT Security Testing Plan](https://github.com/w3c/wot-security-testing-plan).

In the documents above we address the threats and attack surfaces of the
WoT in detail.  In the following we have answered the questions posed by the
W3C Security and Privacy Questionnaire as best as we could... but please take into consideration
that most of these questions are not fully applicable to our situation.

Security in the IoT is unavoidably more complex than in the web.
IoT systems often use patterns of communication that are more general
than the relatively straightforward client-server architecture of web servers and browsers.
For example, the "same origin policy" is considered a cornerstone of web security.
However, a single IoT device may connect and integrate information from several other
IoT devices (and even send commands to them) as a fundamental part of its operation.
In addition,
security on the web is often concerned with the "user's device" or the "user agent",
which is always a single client (the browser).
The IoT is often more concerned with machine-to-machine communication;
there is frequently not even a human "user" directly associated with a device.
If an IoT device _is_ associated with a user, such as in a Smart Home context,
the device may be a client, or
a server---or even both at the same time.
Devices may also be associated with many users, not just one.
Finally, even if an IoT device has
a "user interface" it will be more varied than that of the browser,
and this UI will be under control of the device manufacturer, not the proposed WoT standard.

The kinds of risks we have to deal with in the WoT are also different than
those in the Web.  For example, unlike HTML the WoT does not directly support downloading
and executing scripts from other network services.  So many risks having
to deal with such execution are not relevant.  On the other hand, among other risks, the types
of sensors and actuators supported by IoT devices are much broader and
can even include systems whose compromise would have safety implications.

## Questions and Answers

### 1 [What information might this feature expose to Web sites or other parties, and for what purposes is that exposure necessary?](https://www.w3.org/TR/security-privacy-questionnaire/#purpose)
The following addresses this question for each deliverable:
* Thing Description (TD): A TD includes information about a Thing's network API
  for the purpose of interacting with it.
  This includes a description of security mechanisms used for the purpose of developers 
  needing to know what is necessary to interact with a Thing.
  This metadata is non-secret information only, but if TDs are freely available this
  could allow attackers to scan for vulnerabilities; this is discussed in the "Vulnerability Auditing"
  Security Consideration in the TD document.
  One issue is that TDs are descriptive and so can be used to describe insecure interfaces
  as well as secure ones.  TDs describing insecure interfaces should not be generally distributed
  but the interfaces they describe should also not be made generally available but should be protected
  by other means, such as being on a segmented network.
  A TD can optionally link to related resources and metadata at the discretion of the provider,
  on an as-needed basis.  In general, publishing information in a TD should be treated in the same
  way as publishing information on a web site, such as a blog, and with similar access controls.
* Profiles restrict the information available from TDs: 
  they define a strict subset, with the purpose of improving interoperability.
  As a subset, all information published under a Profile is already covered by the TD specification.
  Profiles, do, however, have additional recommendations about best practices which should be 
  followed by new implementations.
* Discovery defines a means of distributing TDs that allows for access control.
  It is not required, but when implemented following this specification would have two phases,
  strictly separated: Introduction (first contact) and Exploration (metadata access).
  Introductions provide locations (URLs) of Exploration services without providing any metadata.
  They may use potentially insecure mechanisms to broadcast these URLs (for example, a QR code)
  but Introductions are for the purpose of finding Exploration services only. 
  Exploration services provide TDs as above, 
  but only after an opportunity to check authentication and authorizations.
* Architecture addresses an overview of the above and describes some usage patterns.

### 2 [Do features in your specification expose the minimum amount of information necessary to enable their intended uses?](https://www.w3.org/TR/security-privacy-questionnaire/#minimum-data)
* TDs provide the necessary API information for a developer to interact with a Thing.
  Some of the information provided in a TD is also available upon actually interacting with a Thing 
  (for example, the security mechanism used) but in some use cases for TDs (such as development) this
  information is necessary in advance of actually interacting with a Thing instance.
  Through several design iterations we have converged on the set of information needed to allow
  a TD Consumer to reliably connect to a described Thing.
* Profiles define a subset of all TDs, so the information provided is also a subset.
* Discovery provides a set of TDs, and additional metadata for managing TDs, such as time of last update. 
  This additional metadata is necessary to identify stale information.

### 3 [How do the features in your specification deal with personal information, personally-identifiable information (PII), or information derived from them?](https://www.w3.org/TR/security-privacy-questionnaire/#personal-data)
**TO DO**: The following is the answer to a slightly different question, about *whether* we have PII.  It needs to be updated.

**Yes, Indirectly.**  The WoT Thing Description describes IoT devices and may include
information such as location and type.  If these devices can be associated
with an owner, then it may be possible to infer information about the
owner.  For example, if a user is associated with a device as an owner,
and that device is a baby monitor, then the user may have a baby,
the user is probably in a certain age range, and so forth.

The WoT Thing Description (TD) also allows extension via the inclusion
of custom vocabularies.  Although the WoT standard itself does not
have any requirement for PII, it is possible an extension might.  We
consider this aspect of PII inclusion to be out of scope.

As for the indirect risk, in our Security Considerations
we recommend that as a precaution a 
WoT Thing Description should be treated _as if_ it contained PII
and be stored, cached, and transmitted accordingly.  For example,
we recommend that TDs only be distributed to authorized and authenticated
users (for example, via a directory service protected by access controls or to a registered owner)
and only be cached for a limited time.

### 4 [How do the features in your specification deal with sensitive information?](https://www.w3.org/TR/security-privacy-questionnaire/#sensitive-data)
**TODO**.  This was a response to a question about "high-value" data but the actual description
was about credential management (which is one form of sensitive information).
This needs to be updated and aligned with the details of the question and 
perhaps discuss other forms of sensitive data (e.g. financial information).

**Yes.**  A WoT Thing may both require credentials to be accessed and
use credentials to access other devices.  However, these are generally
to secure M2M communication and are not (or should not be) tied directly to
user credentials used for other services.  We also
define an architecture for managing sensitive credentials
securely.

The WoT architecture deals with the operational phase of IoT devices
and does not itself specify how credentials are provisioned to devices.
The WoT Architecture document does however recommend a strict separation
of private security data from public data and metadata, and
recommends the use of an isolated private security data subsystem
in the implementation of IoT devices,
such as a TPM (Trusted Platform Module).

The WoT Runtime and WoT Scripting API are defined in such a way
that they do not have direct access to private credentials.
Instead, an "abstract data type" is used in the WoT Protocol Bindings 
to implement security operations such as authentication and encryption.
These operations can be implemented in such a way that they do not
reveal private security data to WoT Applications or to other devices.

### 5 [Do the features in your specification introduce new state for an origin that persists across browsing sessions?](https://www.w3.org/TR/security-privacy-questionnaire/#persistent-origin-specific-state)
**No**, for both the interpretation of "session" as a browser session
and as a WoT Runtime instance.

This is not a browser-oriented specification although
WoT Things can be accessed through browsers as if they
were web services. 
However, no new state is introduced or required in browsers beyond
current mechanisms (cookies, etc).

WoT Things can also act as clients, however, accessing
web services and other WoT Things acting as servers.
It is also possible that the same device could instantiate
multiple WoT Runtimes.  However, there is no mechanism provided
for sharing state between such instances. Therefore if we consider each instance
to be a session, then no state can be shared across such "sessions", 
at least via implicit internal mechanisms.
Of course these instances could define and engage in explicit network interactions
and share information that way.

### 6 [Do the features in your specification expose information about the underlying platform to origins?](https://www.w3.org/TR/security-privacy-questionnaire/#underlying-platform-data)

### 7 [Does this specification allow an origin to send data to the underlying platform?](https://www.w3.org/TR/security-privacy-questionnaire/#send-to-platform)

### 8 [Do features in this specification enable access to device sensors?](https://www.w3.org/TR/security-privacy-questionnaire/#sensor-data)
**Yes.**  Many other sensors can be attached to an IoT 
device and we do not constrain these in any way.

It is the responsibility of the user to only connect and
provision devices they trust, to select devices with
good security, and manage the data that is
collected appropriately.

The metadata provided in the WoT Thing Description
can be helpful in this regard since the security mechanisms
supported by a device can be easily inspected and,
via semantic annotations, the type of data provided
by the device can be determined.

### 9 [Do features in this specification enable new script execution/loading mechanisms?](https://www.w3.org/TR/security-privacy-questionnaire/#string-to-script)
**TODO**: this is really an question that should be answered in Architecture.  For TDs themselves the 
answer is **No**, and since the Scripting API is not normative the answer is technically "No" even for architecture,
although we should mention the existence of the Scripting API.

**Yes, to execution.**
The WoT architecture enables WoT Things to run applications based
on ECMAScript, using a constrained API, and with suitable
restrictions, such as no direct access to private security data.

**No, to loading.**
A mechanism for loading new scripts is not defined
and is currently considered to be out of scope.
Our architecture assumes the scripts running inside a WoT Thing
are trusted implementations provided by the manufacturer
of the device and installed using a suitable update
mechanism; but this update mechanism is not defined in our
architecture and is also currently considered to be out of scope.

### 10 [Do features in this specification allow an origin to access other devices?](https://www.w3.org/TR/security-privacy-questionnaire/#remote-device)

### 11 [Do features in this specification allow an origin some measure of control over a user agent’s native UI?](https://www.w3.org/TR/security-privacy-questionnaire/#native-ui)
**No**.  The WoT Architecture is M2M and makes no mention of direct
user interfaces.

However, some devices connected via the WoT may have
local user interfaces of various kinds (buttons, speakers, displays, etc.)
which might be exposed to control
over network interactions.
Exposure of such controls
is at the discretion of individual device manufacturers,
who should do an analysis of security risks as part of
their software development process.

### 12 [What temporary identifiers do the features in this specification create or expose to the web?](https://www.w3.org/TR/security-privacy-questionnaire/#temporary-id)

### 13 [How does this specification distinguish between behavior in first-party and third-party contexts?](https://www.w3.org/TR/security-privacy-questionnaire/#first-third-party)

### 14 [How do the features in this specification work in the context of a browser’s Private Browsing or Incognito mode?](https://www.w3.org/TR/security-privacy-questionnaire/#private-browsing)
**N/A**.  This concept is not applicable to the WoT context, as there is no user agent.

### 15 [Does this specification have both "Security Considerations" and "Privacy Considerations" sections?](https://www.w3.org/TR/security-privacy-questionnaire/#considerations)
**Yes**.  These sections in the WoT Thing Description document are
specific to the Thing Description.
Some more general considerations are also given in the WoT Architecture document.
Mitigations for each security and privacy consideration are discussed in
the appropriate sections of these document as well as the
[WoT Security and Privacy Guidelines](https://github.com/w3c/wot-security/) document.

### 16 [Do features in your specification enable origins to downgrade default security protections?](https://www.w3.org/TR/security-privacy-questionnaire/#relaxed-sop)
**No**.  A WoT Thing Description describes what a WoT Thing does and
requires, no more and no less.
There is however an option in the WoT Thing Description to specify
use of one of several different alternative security mechanisms to access a resource.
The designer of a WoT Server needs to ensure that the least secure alternative
is sufficiently secure for the intended application.

### 17 [How does your feature handle non-"fully active" documents?](https://www.w3.org/TR/security-privacy-questionnaire/#non-fully-active)

### 18 [What should this questionnaire have asked?](https://www.w3.org/TR/security-privacy-questionnaire/#missing-questions)




## OLD Questions and Answers
These were the responses to the last questionnaire, and
do not necessarily map directly onto "new" questions above.
These will be deleted in the final submission.

### 1. [Does this specification deal with personally-identifiable information?](https://www.w3.org/TR/security-privacy-questionnaire/#pii)

**Yes, Indirectly.**  The WoT Thing Description describes IoT devices and may include
information such as location and type.  If these devices can be associated
with an owner, then it may be possible to infer information about the
owner.  For example, if a user is associated with a device as an owner,
and that device is a baby monitor, then the user may have a baby,
the user is probably in a certain age range, and so forth.

The WoT Thing Description (TD) also allows extension via the inclusion
of custom vocabularies.  Although the WoT standard itself does not
have any requirement for PII, it is possible an extension might.  We
consider this aspect of PII inclusion to be out of scope.

As for the indirect risk, in our Security Considerations
we recommend that as a precaution a 
WoT Thing Description should be treated _as if_ it contained PII
and be stored, cached, and transmitted accordingly.  For example,
we recommend that TDs only be distributed to authorized and authenticated
users (for example, via a directory service protected by access controls or to a registered owner)
and only be cached for a limited time.

### 2. [Does this specification deal with high-value data?](https://www.w3.org/TR/security-privacy-questionnaire/#credentials)

**Yes.**  A WoT Thing may both require credentials to be accessed and
use credentials to access other devices.  However, these are generally
to secure M2M communication and are not (or should not be) tied directly to
user credentials used for other services.  We also
define an architecture for managing sensitive credentials
securely.

The WoT architecture deals with the operational phase of IoT devices
and does not itself specify how credentials are provisioned to devices.
The WoT Architecture document does however recommend a strict separation
of private security data from public data and metadata, and
recommends the use of an isolated private security data subsystem
in the implementation of IoT devices,
such as a TPM (Trusted Platform Module).

The WoT Runtime and WoT Scripting API are defined in such a way
that they do not have direct access to private credentials.
Instead, an "abstract data type" is used in the WoT Protocol Bindings 
to implement security operations such as authentication and encryption.
These operations can be implemented in such a way that they do not
reveal private security data to WoT Applications or to other devices.

### 3. [Does this specification introduce new state for an origin that persists across browsing sessions?](https://www.w3.org/TR/security-privacy-questionnaire/#persistent-origin-specific-state) 

**No**, for both the interpretation of "session" as a browser session
and as a WoT Runtime instance.

This is not a browser-oriented specification although
WoT Things can be accessed through browsers as if they
were web services. 
However, no new state is introduced or required in browsers beyond
current mechanisms (cookies, etc).

WoT Things can also act as clients, however, accessing
web services and other WoT Things acting as servers.
It is also possible that the same device could instantiate
multiple WoT Runtimes.  However, there is no mechanism provided
for sharing state between such instances. Therefore if we consider each instance
to be a session, then no state can be shared across such "sessions", 
at least via implicit internal mechanisms.
Of course these instances could define and engage in explicit network interactions
and share information that way.

### 4. [Does this specification expose persistent, cross-origin state to the web?](https://www.w3.org/TR/security-privacy-questionnaire/#persistent-identifiers) 

**No**, when a WoT Thing acts in the client role.

**Yes**, in the case that a WoT Thing is acting as a server and exposes interactions that
allow properties to be modified.  Modifications by
one client may be visible to another in this case.

This risk of this is mitigated by the fact that
WoT Things support various mechanisms to limit access to
authorized users, in the same way as web services.
Interactions that modify state should be protected in both cases
by access controls.

There is a potential fingerprinting risk, which is discussed in the Security Considerations,
and is related to the PII risk discussed above.
This can be mitigated by controlling access to WoT metadata
such as WoT Thing Descriptions using access controls as well.

### 5. [Does this specification expose any other data to an origin that it doesn’t currently have access to?](https://www.w3.org/TR/security-privacy-questionnaire/#other-data)

**Yes.**

WoT Things by nature will be connected into a network of devices.
A distributed application running across a WoT System may involve
communications between many WoT Things, some acting as
servers, some acting as clients, some acting as both.

In addition, WoT Things may act as gateways to other
non-HTTP devices using other network protocols, such
as MQTT or CoAP, or to interface to a variety of non-IP
devices using BACNET, ECHONET, CAN, X10, SPI, I2C, Bluetooth, LoRA,
among many many other possibilities.

Unfortunately, the single-origin model used in
web servers and browsers does not scale well to this model.
Instead, security strategies developed for microservice
architectures, such as Zero-Trust models, may be more appropriate.

Securing a distributed IoT application in general is out of scope of this
specification.  We do however discuss several common connection
patterns (client-server, proxy, etc) and how they can be secured.

This risk is mitigated by the fact that endpoint IoT devices
are generally not exposed directly on the internet, but
are mediated by gateways and cloud services, and are often
managed explicitly by organizations (e.g. in a Smart Factory
or Smart City) rather than by individuals.

### 6. [Does this specification enable new script execution/loading mechanisms?](https://www.w3.org/TR/security-privacy-questionnaire/#string-to-script)

**Yes, to execution.**
The WoT architecture enables WoT Things to run applications based
on ECMAScript, using a constrained API, and with suitable
restrictions, such as no direct access to private security data.

**No, to loading.**
A mechanism for loading new scripts is not defined
and is currently considered to be out of scope.
Our architecture assumes the scripts running inside a WoT Thing
are trusted implementations provided by the manufacturer
of the device and installed using a suitable update
mechanism; but this update mechanism is not defined in our
architecture and is also currently considered to be out of scope.

### 7. [Does this specification allow an origin access to a user’s location?](https://www.w3.org/TR/security-privacy-questionnaire/#location)

**No**, if the origin is considered to be a WoT Server and the user is a WoT Client.

**Yes, possibly**, if the origin is a WoT Client or is a WoT Servient (both client and server)
and the "user" device is a WoT Server or WoT Servient, which is possible in some configurations.

As noted above in the PII response, a device
location may be encoded in a WoT Thing Description using
an extension vocabulary, 
and in some cases such a device location could be
associated with a user's location.
Location information, however, is neither a standard nor
a required part of the architecture.
It is, however, common in institutional IoT applications,
but in this case the devices are typically not
associated with a particular user's location.  In fact
placement of location information in the TD is useful
mostly for devices installed in a static location.

A manufacturer of a device could also define an
interaction that returns the
location of the device.
This is more likely in dynamic location use cases.
We do not provide constraints on this, since it is usually
the _purpose_ of IoT devices to provide access to sensor data.

To mitigate this risk,
we do provide mechanisms to control access to
interactions and a manufacturer can use these to
prevent accidental disclosure to unauthorized users,
and recommend that these mechanisms be used when PII
can be inferred from device information,
location data being just one example of that.
A user can also inspect the WoT Thing Description to
determine whether the device returns location information,
assuming the manufacturer has not obfuscated the purpose
of interactions.  

### 8. [Does this specification allow an origin access to sensors on a user’s device?](https://www.w3.org/TR/security-privacy-questionnaire/#sensors)

**Yes.**  Many other sensors can be attached to an IoT 
device and we do not constrain these in any way.

It is the responsibility of the user to only connect and
provision devices they trust, to select devices with
good security, and manage the data that is
collected appropriately.

The metadata provided in the WoT Thing Description
can be helpful in this regard since the security mechanisms
supported by a device can be easily inspected and,
via semantic annotations, the type of data provided
by the device can be determined.

### 9. [Does this specification allow an origin access to aspects of a user’s local computing environment?](https://www.w3.org/TR/security-privacy-questionnaire/#local-device)

**No**, in general, if we interpret the origin as a WoT Server, the
user's local computing environment a WoT Client that
retreives content from that WoT Server.
There is no executable content
expected in data or required in the metadata (Thing Description) provided by WoT Things.

If we reverse the definitions, and let the origin be a WoT Client
and the user be a WoT Server, which is possible in some WoT topologies,
in general the answer is still no under reasonable constraints on system design,
such as not exposing a capability to execute scripts on the WoT Server.
The only operations that a WoT Server should perform
on behalf of a WoT Client are those that it chooses
to support via its exposed interactions (network API).
In fact the correct answer to this question in this case is
that the developer of a WoT Server can ensure that there is
no _unintended_ access to the WoT Server's local computing environment.

### 10. [Does this specification allow an origin access to other devices?](https://www.w3.org/TR/security-privacy-questionnaire/#remote-device) 

**Yes**, as discussed above.  A WoT Thing can act as a gateway to 
other WoT Things or to other non-IP protocols.
In fact, access to other devices is one of the primary use cases of WoT.

The situation is unavoidably more complex than the client-server
architecture of browsers.  A better analogy than browsers
would be the microservice architecture used by many web services.
The WoT Architecture supports best practices there, such
as Zero-Trust networks.

However, to be more specific, here "origin" in the usual
web meaning assumed by the question means content from a specific web server,
and "access to other devices" would mean from the browser.
In the WoT context, "origin" could be interpreted as 
a WoT Server (WoT Thing in server role) and "browser" would
be a WoT Client.  In that specific case, there is no
way for an arbitrary server to force an arbitrary client
to access another device.  The WoT Client is in control,
initiates messages, and decides what to do with the
responses.  Even if we reverse the roles, which is
common in the IoT (IoT endpoint devices are often servers) a WoT Server
is never forced to do what a WoT Client requests.

However, a "gateway" WoT Servient (Client/Server hybrid) _might_ be developed by
a manufacturer that allows broad access to other devices.
In this case, such a gateway service should be protected
by strict access controls,
such as in the Zero-Trust approach, where _every_ service
uses access controls, encryption, and authentication.

### 11. [Does this specification allow an origin some measure of control over a user agent’s native UI?](https://www.w3.org/TR/security-privacy-questionnaire/#native-ui) 

**No**.  The WoT Architecture is M2M and makes no mention of direct
user interfaces.

However, some devices connected via the WoT may have
local user interfaces of various kinds (buttons, speakers, displays, etc.)
which might be exposed to control
over network interactions.
Exposure of such controls
is at the discretion of individual device manufacturers,
who should do an analysis of security risks as part of
their software development process.

### 12. [Does this specification expose temporary identifiers to the web?](https://www.w3.org/TR/security-privacy-questionnaire/#temporary-id)

**Yes**.  In fact _permanent_ identifiers may be exposed.

The WoT Thing Description has a required element (not actually
mentioned in the current document, the WoT Architecture, but
in the WoT Thing Description) which is meant to be a unique ID
(a URN, actually).
This is necessary to support Linked Data.
In fact, some domains, such as medical devices in the US,
have a legal requirement to support immutable identifiers.

However, we suggest that the tracking risk this poses should
be mitigated, whenever possible (e.g. if not legally disallowed
as discussed above) by allowing such identifiers to be modified
at least when the devices are reprovisioned.
Generally, though, the identifiers in Thing Descriptions 
are relatively long-lived.

A further mitigation recommendation therefore is one already discussed:
always treating Thing Descriptions as if they included PII
and controlling access to them via strict access controls.

Finally, even without explicit IDs,
it might be possible to use fingerprinting to uniquely identify TDs.

### 13. [Does this specification distinguish between behavior in first-party and third-party contexts?](https://www.w3.org/TR/security-privacy-questionnaire/#first-third-party)

**N/A**.  This concept is not applicable to the WoT context.

### 14. [How should this specification work in the context of a user agent’s "incognito" mode?](https://www.w3.org/TR/security-privacy-questionnaire/#incognito)

**N/A**.  This concept is not applicable to the WoT context, as there is no user agent.

### 15. [Does this specification persist data to a user’s local device?](https://www.w3.org/TR/security-privacy-questionnaire/#storage) 

**Yes**, in both the client and server roles.

If the "user's device" is acting in a server role it may support interactions that
support POST requests.  Servers can of course retain state posted to them.
If this state is too general (for example, a property that allows
a client to POST and GET arbitrary string data or a large number), _and_ is not 
protected with access controls, _and_ if the device can be 
associated with a particular user, _and_ the network protocol
allows accesses to be tied to physical location, then this is 
a potential physical tracking risk. However, providing access
controls on interactions (which is strongly recommended for
all personal devices) mitigates this issue.

This is also true in some cases, but under the developer's control,
when a user's devices are acting in the client role.
Even if the user's device is acting as a client,
it could theoretically be programmed to
retrieve data provided by a server and then post it back to that server later.
This could also be enabled by a webhook pattern in an event notification, for example.
This can be mitigated by establishing explicit trust relationships
and providing explicit access controls between any pair of
devices before allowing data to be exchanged.

Note that scripts cannot be included in TDs, only data.  So devices
always have local control over what data they retain.  WoT Things
are never _forced_ to retain state and return it later.

### 16. [Does this specification have a "Security Considerations" and "Privacy Considerations" section?](https://www.w3.org/TR/security-privacy-questionnaire/#considerations)

**Yes**.

This section in the WoT Architecture document is fairly high-level
however and meant to be a summary of the most important considerations.
This section in the WoT Thing Description document is more detailed and
specific to the Thing Description.
There are also sections in each WoT building block
document and a more general document, the WoT Security and Privacy Considerations
document, as noted in the introduction.

### 17. [Does this specification allow downgrading default security characteristics?](https://www.w3.org/TR/security-privacy-questionnaire/#relaxed-sop) 

**No**.  A WoT Thing Description describes what a WoT Thing does and
requires, no more and no less.
There is however an option in the WoT Thing Description to specify
use of one of several different alternative security mechanisms to access a resource.
The designer of a WoT Server needs to ensure that the least secure alternative
is sufficiently secure for the intended application.

