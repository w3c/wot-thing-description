# W3C Web of Things (WoT)
## Responses to the W3C Security and Privacy Questionnaire

This document was prepared by the Web of Things (WoT) Working Group,
responding to the questions raised in the December 16, 2021 version of the 
[Self-Review Questionnaire: Security and Privacy](https://www.w3.org/TR/2021/NOTE-security-privacy-questionnaire-20211216)
document published by the W3C and required as part of both Security and Privacy
Wide Review processes.

These responses relate to all WoT deliverables being developed as part of the current charter.
In some cases a question needs to be considered with respect to a particular deliverable,
and these will be identified when necessary:
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
describing constraints on certain WoT Implementations to achieve out-of-the-box interoperability.
Only when such constraints have a security impact they will be discussed in association with that
document.  Otherwise WoT systems satisfying a profile are special cases of the systems
described in the other documents.

In the following we have used this mapping to interpret the various
questions.  For example, if a question or part of a question is relevant to content delivery
then we will consider it in whole or in part as relating to the Discovery deliverable, as opposed to
the Thing Description deliverable.

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
that many of these questions are not fully applicable to our situation, or 
may have required some additional interpretation to clarify the intent.

Security in the IoT is unavoidably more complex than in the Web.
IoT systems often use patterns of communication that are more general
than the relatively straightforward client-server architecture of Web servers and browsers.
For example, the "same origin policy" is considered a cornerstone of Web security.
However, a single IoT device may connect and integrate information from several other
IoT devices (and even send commands to them) as a fundamental part of its operation.
In addition,
security on the Web is often concerned with the "user's device" or the "user agent",
which is always a single client (the browser).
The IoT is often more concerned with machine-to-machine communication;
there is frequently not even a human "user" directly associated with a device.
If an IoT device _is_ associated with a user, such as in a Smart Home context,
the device may be a client, or
a server---or even both at the same time.
Devices may also be associated with many users, not just one.
Finally, even if an IoT device has
a "user interface" it will be more varied than that of the browser,
may involve physical buttons and actuators not under the control of the usual
HTML-based Web platform or programming model,
and this UI will be under control of the device manufacturer,
not the proposed WoT standard.

The kinds of risks we have to deal with in the WoT are also different than
those in the Web.  For example, unlike HTML the WoT does not directly support downloading
and executing scripts from other network services.  So many risks having
to deal with such execution are not relevant.  On the other hand, among other risks, the types
of sensors and actuators supported by IoT devices are much broader and
can even include systems that,
when compromised, could have safety implications.

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
  as well as secure ones.  
  An insecure interface is one with a known vulnerability.
  TDs describing insecure interfaces should not be generally distributed.
  However, the interfaces they describe should also not be made generally available but should be protected
  by other means, such as being on a segmented secure network.
  A TD can optionally link to related resources and metadata at the discretion of the provider,
  on an as-needed basis.  In general, publishing information in a TD should be treated in the same
  way as publishing information on a web site, such as a blog, and with similar access controls.
* Profiles restrict the information available from TDs: 
  they define a strict subset, with the purpose of improving interoperability.
  As a subset, all information published under a Profile is already covered by the TD specification.
  Profiles, do, however, have additional recommendations about best practices which should be 
  followed by new implementations to improve security.
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
Currently WoT specifications do not deal directly with sensor data but with metadata.
The WoT Thing Description metadata describes IoT devices and may include
information such as location and type.  If these devices can be associated
with an owner, then it may be possible to infer information about the
owner.  For example, if a user is associated with a device as an owner,
and that device is a baby monitor, then the user may have a baby,
the user is probably in a certain age range, and so forth.

The WoT Thing Description (TD) also allows extension via the inclusion
of custom vocabularies.  Although the WoT standard itself does not
have any explicit requirement for PII, it is possible an extension might.  

As for the indirect risk, in our Security Considerations
we recommend that as a precaution a 
WoT Thing Description should be treated _as if_ it contained PII
and be stored, cached, and transmitted accordingly.  For example,
we recommend that TDs only be distributed to authorized and authenticated
users and only be cached for a limited time.

Since we assume that TDs can contain PII or that PII can be inferred from them
in some circumstances, the Discovery specification
includes features to address these points.
In particular, TD Directories (part of the Discovery specification)
support access control (so that TDs can be limited in distribution to authorized
parties) and expiry requirements (so that TDs will be automatically removed when
they expire) and mechanisms to explicitly delete registered TDs.
Access controls are based on known best methods for web services (OAuth, etc).
Other security and privacy considerations warn against embedding metadata in
public information that is not protected,
such as URLs presented during Discovery's Introduction phase.

### 4 [How do the features in your specification deal with sensitive information?](https://www.w3.org/TR/security-privacy-questionnaire/#sensitive-data)
Sensitive information can include both security secrets (such as private keys, which should never
be distributed to other parties) and information that may be distributed
but only under specific conditions. 
 
A WoT Thing may have credentials to establish its identity (authentication) and allow
for the creation of trusted secure communication channels with other trusted and
authenticated entities.
Additional authorization information may be used in addition to manage access rights to
specific entities.
Authorizations for secure M2M communication may also reveal the identity
of the accessor but this may not be desired when the accessing entity is a 
person or a device that can be associated with a person.
In this case, mechanisms such as tokens and OAuth2 can be used, as with other
web services,
to avoid directly revealing user identities or requiring devices to associate
authorizations directly with users.

The WoT architecture deals with the operational phase of IoT devices
and does not itself directly specify how credentials are provisioned to devices.
The WoT Architecture document does however recommend a strict separation
of private security data from public data and metadata, and
recommends the use of an isolated private security data subsystem
in the implementation of IoT devices,
such as a TPM (Trusted Platform Module).
Sensitive information such as secrets should never be stored or
distributed in TDs in particular.

The test implementations supporting WoT, such as the Scripting API 
supported by node-wat, have been defined in such a way
that user-provided code defining behavior does not have direct access to private credentials.
Instead, an "abstract data type" is used 
to implement security operations such as authentication and encryption.
Implementations have therefore demonstrated that 
these operations can be implemented in such a way that they do not
reveal private security data to WoT Applications or to other devices.

For selectively accessible sensitive information,
Discovery defines a web service to provide TDs and some Things described by 
TDs may need to manage sensitive data internally and provide a network interface 
equivalent to a web service that provides selective access to it.
Both cases should manage sensitive information using known best practices i
for web services, including encrypting data at rest, using secure transport, and enforcing access control.

As noted above, in some cases TDs themselves may be considered "sensitive information",
for example if they describe known-vulnerable devices.  
This may be the case during development, for example.
In this case appropriate access controls should be put in place to restrict
access to TDs.  This is supported by the WoT Discovery specification, just like 
any other web service managing access to sensitive information. 
Known-vulnerable Things
themselves should be protected by additional means such as a segmented network,
an approach also described in the Architecture document.

These issues are discussed in the Security Considerations sections of the 
various specifications.

### 5 [Do the features in your specification introduce new state for an origin that persists across browsing sessions?](https://www.w3.org/TR/security-privacy-questionnaire/#persistent-origin-specific-state)
This is not a browser-oriented specification although
WoT Things can be accessed through browsers as if they were web services. 
However, no new state is introduced or required in browsers beyond
current mechanisms (cookies, OAuth sessions, etc).
A WoT Thing can be thought of as simply another web service, so no *new* mechanisms are defined.
An IoT device can also be a client of a WoT Thing but in this case
implements only the functionality required by HTTP and the interface described in
the TD. 
Clients only support existing mechanisms (such as OAuth sessions) already supported
by browsers. 
No "new" mechanisms are defined *by the specification* to retain state.

A given client may, however, choose to retain state between sessions
since in IoT devices there is no clear definition of "session".
In fact, such data retention
may be part of the device's purpose (for example, a device designed to log history data
from a sensor).

We also define a Directory web service as part of Discovery whose
*purpose* is to retain information about other Things and make it available to 
other Things with suitable access rights.
This web service however includes an API that allows the client to manage what state is
retained and to delete it if necessary.

### 6 [Do the features in your specification expose information about the underlying platform to origins?](https://www.w3.org/TR/security-privacy-questionnaire/#underlying-platform-data)
If we interpret "platform (browser)" as the hardware/software platform running the
implementation of the WoT Consumer and interpret "origin" as the WoT Thing the
WoT Consumer is interacting with then the
answer is no: WoT defines a TD for WoT Things, not WoT Consumers, so the exposure of 
any information is from the "origin" to the "platform", not the other way around.

However, the *intent* of this question is whether a device associated with a "user" can
expose information about that device to an external entity, such as a 
company or organization, which may seek to capture data about the user.

This can indeed happen if a user chooses to make a Thing Description about a device
they control available to an organization by sending it to them or giving them access rights.
The design of Discovery, however, provides for access controls on mechanisms used to distribute such
information so the user would have to grant access rights to the organization or explictly
register the information with a Directory service made available by the organization. 
There are use cases where this is appropriate, for example a user wanting to share data
from a health monitoring system with their doctor.

However, the TD does not by default include information about the underlying 
hardware or software platform implementing the Thing.

### 7 [Does this specification allow an origin to send data to the underlying platform?](https://www.w3.org/TR/security-privacy-questionnaire/#send-to-platform)
The answer to this is yes, since common WoT Things are sensors whose purpose
is to generate data and make it available (either via pull or push interactions) with the
client.  
In either case a client has to take specific actions to initiate a data transfer (for
pull, a request is necessary; for push, a subscription is necessary).
However, this question can also be considered an extension of question 6,
but with roles reversed.

An "origin" in the WoT system could be a Thing or a Thing Description
Directory.  
Both of these are web services.  
A Thing can send any kind of data, a 
Thing Description Directory specifically sends Thing Descriptions.

The detailed description of the above question in the link specifically discusses
whether the platform (client) can handle URLs of various kinds, 
including (for example) file URIs.
TDs include a variety of data but can include URIs of various kinds which need to 
be dereferenced to perform interactions.
In Architecture we describe how WoT Runtimes should execute in a restricted sandbox
so dereferencing of URLs provided in TDs will be restricted in what they can access.
In particular a platform should restrict access to specific protocols.
(TODO: should be a Consideration about this in the TD and/or Architecture specification).

### 8 [Do features in this specification enable access to device sensors?](https://www.w3.org/TR/security-privacy-questionnaire/#sensor-data)
**Yes.**  The intent of this question is that the "device" is the browser.
Please note however that we are interpreting this more broadly
to mean "devices managed by the user".
Such devices may include WoT Things (which is actually
an origin according to the platform/origin view).

Many sensors can be attached to an IoT 
device and WoT does not constrain these in any way,
but neither do we make it mandatory that this data be
available to any client.

It is the responsibility of the user to only connect and
provision devices they trust, to select devices with
good security, and manage the distribution of data that is
collected appropriately using access controls.

The metadata provided in the WoT Thing Description
can be helpful in this regard since the security mechanisms
supported by a device can be easily inspected and,
via semantic annotations, the type of data provided
by the device can be determined.

### 9 [Do features in this specification enable new script execution/loading mechanisms?](https://www.w3.org/TR/security-privacy-questionnaire/#string-to-script)
For the normative specifications under review themselves the answer is **No**.

A Scripting API is discussed in WoT Architecture but it is not normative.
In general, the behaviour of a WoT Thing needs to be defined somehow but this
definition is beyond the scope of the current set of normative specs.

### 10 [Do features in this specification allow an origin to access other devices?](https://www.w3.org/TR/security-privacy-questionnaire/#remote-device)
An origin is a WoT Thing and is like any other web service which can access other
web services. So the question is really asking if features in the specification allow
a *server* (in WoT terminology, a Thing) unmediated access to capabilities of the *client* (a WoT Consumer).
The answer to this question is **No**.

The roles might be reversed however and a WoT Thing might be a device managed by a user that
exposes that network interface to a WoT Consumer managed by an organization.
Depending on the use case, the WoT Thing may provide mediated (indirect) access to other WoT Things.
For example, it could be a proxy or shadow that forwards interactions to another device.  
However, the key factor here is that access is mediated:
like a web service, which may call other web service, a WoT Thing describes and provides
access to only its own API.  The provider of a WoT Thing choses what interactions it
exposes and what it can do.

### 11 [Do features in this specification allow an origin some measure of control over a user agent’s native UI?](https://www.w3.org/TR/security-privacy-questionnaire/#native-ui)
**No**. The WoT Architecture is M2M and makes no mention of direct
user interfaces.  One key part of this question is "control".
WoT Consumer reading data from a WoT Thing or a WoT Thing receiving data
is not ceding direct control to any UI that may be associated with these entities.

Some devices connected via the WoT may have
local user interfaces of various kinds (buttons, speakers, displays, etc.)
which might be exposed to control
over network interactions.
Exposure of such controls
is at the discretion of individual device manufacturers,
who should do an analysis of security risks as part of
their software development process.

Strings defined in a TD might also be used to generate UIs, such as 
web dashboards. 
Some strings in fact, such as "title", are explicitly included for this use case.
We include a security consideration in the TD spec to 
warn that any strings in TDs should be sanitized before being included in
a UI, for instance including it in HTML sent to another client, 
as with any other source
of external string content.

### 12 [What temporary identifiers do the features in this specification create or expose to the web?](https://www.w3.org/TR/security-privacy-questionnaire/#temporary-id)
The WoT Thing Description has an optional element,
"id" which is should be an URN unique within the local
context (set of all addressable Things for the current application).
It is recommended that such identifiers are cryptographically
generated and take the form of UUIDs without any embedded
metadata.

Such identifiers are necessary to support Linked Data and RDF.
In particular, WoT Directories optionally support SPARQL endpoints
and managed Linked Data.  In order to be managed under this
system, TDs need identifiers. 
However, since identifiers are optional, it is possible to
register an "anonymous" TDs with a Directory for
the purposes of Discovery.  In this case, the Directory will
assign an ID local to the Directory which can be used to manage
the entry, including deleting it.  If the same TD is registered
after deletion, it will be assigned a new local id.  Different
instances of a Directory service will have different local ids
even if the same anonymous TD is registered in them.
Anonymous TDs do, however, make use of specific devices for
specific purposes more difficult.

Some domains, such as medical devices in the US,
have a legal requirement to support immutable identifiers.
In this case (as well as a general mitigation in other cases),
access controls can be used to prevent access to TDs by
those unauthorized to access the associated Things.

The tracking risk ids pose can
also be mitigated, whenever possible (e.g. if not legally disallowed
as discussed above) by allowing such identifiers to be periodically
updated.  At the very least, identifiers should be replaced
when the devices are reprovisioned, which will occur upon a change of
ownership.

### 13 [How does this specification distinguish between behavior in first-party and third-party contexts?](https://www.w3.org/TR/security-privacy-questionnaire/#first-third-party)
**N/A**.

### 14 [How do the features in this specification work in the context of a browser’s Private Browsing or Incognito mode?](https://www.w3.org/TR/security-privacy-questionnaire/#private-browsing)
**N/A**.  This concept is not applicable to the WoT context, as there is no user agent.

### 15 [Does this specification have both "Security Considerations" and "Privacy Considerations" sections?](https://www.w3.org/TR/security-privacy-questionnaire/#considerations)
**Yes**.  General considerations are given in the WoT Architecture document.
More specific considerations are presented in each of the 
WoT Thing Description, WoT Discovery, and WoT Profile documents.
Mitigations for each security and privacy consideration are discussed in
the appropriate sections of these documents.
A threat model and a discussion of risks along with proposed best
practices is presented in the informative
[WoT Security and Privacy Guidelines](https://github.com/w3c/wot-security/) document.

### 16 [Do features in your specification enable origins to downgrade default security protections?](https://www.w3.org/TR/security-privacy-questionnaire/#relaxed-sop)
**No**.  A WoT Thing Description describes what a WoT Thing does and
requires, no more and no less.
There is however an option in the WoT Thing Description to specify
use of one of several different alternative security mechanisms to access a resource.
The designer of a WoT Thing needs to ensure that the least secure security
mechanism exposed is sufficiently secure for the intended application.

In addition, the WoT Thing Description does not specify what an origin must do,
it only describes what it actually does.

### 17 [How does your feature handle non-"fully active" documents?](https://www.w3.org/TR/security-privacy-questionnaire/#non-fully-active)
**N/A**. WoT Consumers do not process HTML, do not render documents, and do not support the concept of sessions. 
They may, however, consume multiple TDs and connect to all of them 
simultaneously, but the behaviour is defined by the Consumer, not by any of the origins.

### 18 [What should this questionnaire have asked?](https://www.w3.org/TR/security-privacy-questionnaire/#missing-questions)
* Is your networking model different from the usual client/server model used by browsers and web servers?
A WoT Consumer and WoT Thing can participate in a client/server communication model
especially if they are using a protocol such as HTTP or CoAP based on this model.
However, WoT Things can also provide networking models based on other communication 
approaches, such as publish/subscribe under MQTT.  In addition, explicit publish/subscribe
patterns are supported even under HTTP and CoAP.

* Do you specify the behaviour of origins as well as the client?
Yes.  WoT Things can act as origins, and WoT Thing Descriptions describe Things.
This impacts many of the answers above.  For instance, it would be considered
unusual and a privacy risk to give a fixed identifier to a browser, but it is common
practice to assign a fixed URL to a web server.  WoT Things could be providing
services from an institution or as part of a fixed installation, in which case 
assigning them identifiers as is done with web servers makes sense.  But Things
can also be associated with people like browsers can, in which case making them
anonymous may be the better choice.

* Does your client generally have a user agent, and can it render HTML?
IoT devices may have user interfaces but they are generally very simple and 
not designed to render arbitrary content.  They do not render HTML; we have
browsers for that.
