# Synchronization with the Architecture Specification

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/document%20synchronisation)

Continuation of https://github.com/w3c/wot-thing-description/issues/2120

## Categorization of assertions (tentative)

- A: Those related to the Thing Description document
  - A1: Assertions that are already included in the Thing Description document. No changes to the Thing Description document are necessary.
  - A2: Assertions that differ from what is written in the Thing Description document. If necessary, update the Thing Description document to ensure consistency.
  - A3: Assertions not included in the Thing Description document. Add them if necessary.
- B: Those related to other documents
- C: Assertions for which it is unclear which document they belong to
- D: Assertions to be turned into informative guidelines (or best practices).

## 6. Abstract WoT System Architecture

### 6.1 Fundamental Concepts

#### 6.1.1 Metadata

##### 6.1.1.1 Thing Descriptions

- [ ] 1. In W3C WoT, the description metadata for a Thing instance MUST be available as a WoT Thing Description (TD) [WOT-THING-DESCRIPTION]. ([arch-td-metadata](https://www.w3.org/TR/wot-architecture11/#arch-td-metadata))

  - Category: A1 / A2 / A3 / B / C (example)

- [ ] 2. There MAY be other representations of a Thing such as an HTML-based user interface, simply an image of the physical entity, or even non-Web representations in closed systems. ([arch-other-thing-representations](https://www.w3.org/TR/wot-architecture11/#arch-other-thing-representations))

- [ ] 3. To be considered a Thing, however, at least one TD representation MUST be available. ([arch-td-mandatory](https://www.w3.org/TR/wot-architecture11/#arch-td-mandatory))

#### 6.1.2 Links

- [ ] 4. WoT Thing Descriptions and WoT Thing Models MAY link to other Things, WoT Thing Models, and other resources on the Web to form a Web of Things. ([arch-td-linking](https://www.w3.org/TR/wot-architecture11/#arch-td-linking))

- [ ] 5. Things MUST be hosted on networked system components with a software stack to realize interaction through a network-facing interface, the WoT Interface of a Thing. ([arch-networked](https://www.w3.org/TR/wot-architecture11/#arch-networked))

### 6.5 Interaction Model

- [ ] 6. In addition to navigation affordances (i.e., Web links), Things MAY offer three other types of Interaction Affordances defined by this specification: Properties, Actions, and Events. ([arch-affordances](https://www.w3.org/TR/wot-architecture11/#arch-affordances))

#### 6.5.1 Properties

- [ ] 7. If the data format is not fully specified by the Protocol Binding used (e.g., through a media type), Properties MAY contain one data schema for the exposed state. ([arch-property-dataschema](https://www.w3.org/TR/wot-architecture11/#arch-property-dataschema))

#### 6.5.2 Actions

- [ ] 8. An Action MAY manipulate state that is not directly exposed (cf. Properties), manipulate multiple Properties at a time, or manipulate Properties based on internal logic (e.g., toggle). ([arch-action-functions](https://www.w3.org/TR/wot-architecture11/#arch-action-functions))

- [ ] 9. Invoking an Action MAY also trigger a process on the Thing that manipulates state (including physical state through actuators) over time. ([arch-action-process](https://www.w3.org/TR/wot-architecture11/#arch-action-process))

- [ ] 10. If the data format is not fully specified by the Protocol Binding used (e.g., through a media type), Actions MAY contain data schemas for input parameters and output results. ([arch-action-dataschema](https://www.w3.org/TR/wot-architecture11/#arch-action-dataschema))

#### 6.5.3 Events

- [ ] 11. Events MAY be triggered through conditions that are not exposed as Properties. ([arch-event-trigger](https://www.w3.org/TR/wot-architecture11/#arch-event-trigger))

- [ ] 12. If the data is not fully specified by the Protocol Binding used (e.g., through a media type), Events MAY contain data schemas for the event data and subscription control messages (e.g., a callback URI to subscribe with a Webhook). ([arch-event-dataschema](https://www.w3.org/TR/wot-architecture11/#arch-event-dataschema))

### 6.6 Hypermedia Controls

#### 6.6.1 Links

- [ ] 13. Extension relation types MUST be compared as strings using ASCII case-insensitive comparison, (c.f. ASCII case insensitive). (If they are serialized in a different format they are to be converted to URIs). ([arch-rel-types](https://www.w3.org/TR/wot-architecture11/#arch-rel-types))

- [ ] 14. Nevertheless, all-lowercase URIs SHOULD be used for extension relation types [RFC8288]. ([arch-rel-type-lowercase](https://www.w3.org/TR/wot-architecture11/#arch-rel-type-lowercase))

#### 6.6.2 Forms

- [ ] 15. Form contexts and submission targets MUST both be Internationalized Resource Identifiers (IRIs) [RFC3987]. ([arch-form-iris](https://www.w3.org/TR/wot-architecture11/#arch-form-iris))

- [ ] 16. Form context and submission target MAY point to the same resource or different resources, where the submission target resource implements the operation for the context. ([arch-form-iris2](https://www.w3.org/TR/wot-architecture11/#arch-form-iris2))

- [ ] 17. The request method MUST identify one method of the standard set of the protocol identified by the submission target URI scheme. ([arch-op-request-method](https://www.w3.org/TR/wot-architecture11/#arch-op-request-method))

- [ ] 18. Form fields are optional and MAY further specify the expected request message for the given operation. ([arch-op-expected-request](https://www.w3.org/TR/wot-architecture11/#arch-op-expected-request))

- [ ] 19. Form fields MAY depend on the protocol used for the submission target as specified in the URI scheme. ([arch-op-form-fields-protocol](https://www.w3.org/TR/wot-architecture11/#arch-op-form-fields-protocol))

### 6.7 Protocol Bindings

#### 6.7.1 Hypermedia-driven

- [ ] 20. Interaction Affordances MUST include one or more Protocol Bindings. ([arch-hypermedia](https://www.w3.org/TR/wot-architecture11/#arch-hypermedia))

- [ ] 21. Protocol Bindings MUST be serialized as hypermedia controls to be self-descriptive on how to activate the Interaction Affordance. ([arch-hypermedia-protocol-binding](https://www.w3.org/TR/wot-architecture11/#arch-hypermedia-protocol-binding))

- [ ] 22. The hypermedia controls MAY be cached outside the Thing and used for offline processing if caching metadata is available to determine the freshness. ([arch-hypermedia-caching](https://www.w3.org/TR/wot-architecture11/#arch-hypermedia-caching))

### 6.8 Media Types

- [ ] 23. All data (a.k.a. content) exchanged when activating Interaction Affordances MUST be identified by a media type [RFC2046] in the Protocol Binding. ([arch-media-type](https://www.w3.org/TR/wot-architecture11/#arch-media-type))

- [ ] 24. Protocol Bindings MAY have additional information that specifies representation formats in more detail than the media type alone. ([arch-media-type-extra](https://www.w3.org/TR/wot-architecture11/#arch-media-type-extra))

- [ ] 25. Thus, the Interaction Affordance for structured data types SHOULD be associated with a data schema to provide more detailed syntactic metadata for the data exchanged. ([arch-schema](https://www.w3.org/TR/wot-architecture11/#arch-schema))

### 6.10 WoT System Components and their Interconnectivity

#### 6.10.2 Indirect Communication

- [ ] 26. If necessary, a TD generated by an Intermediary MAY contain interfaces for other communication protocols. ([arch-intermediary-td-extra-protocols](https://www.w3.org/TR/wot-architecture11/#arch-intermediary-td-extra-protocols))

## 10. Security Considerations

### 10.1 WoT Thing Description Risks

#### 10.1.1 Thing Description Private Security Data Risk

- [ ] 27. There SHOULD be a strict separation of Public Security Metadata and Private Security Data. ([arch-security-consideration-separate-security-data](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-separate-security-data))

- [ ] 28. Authentication and authorization SHOULD be established based on separately managed Private Security Data. ([arch-security-consideration-auth-private-data](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-auth-private-data))

- [ ] 29. Producers of TDs MUST ensure that no Private Security Data is included in TDs. ([arch-security-consideration-no-private-security-data](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-no-private-security-data))

#### 10.1.2 Thing Description Communication Metadata Risk

- [ ] 30. Whenever possible, TD creators SHOULD use the vetted communication metadata provided in the WoT Binding Templates. ([arch-security-consideration-communication-binding](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-communication-binding))

- [ ] 31. When generating TDs for an IoT Platform not covered by the WoT Binding Templates, TD creators SHOULD ensure that all the security requirements of the IoT Platform are satisfied. ([arch-security-consideration-communication-platform](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-communication-platform))

### 10.2 WoT Scripting API Risks

#### 10.2.1 Cross-Script Security Risk

- [ ] 32. The WoT Runtime SHOULD perform isolation of script instances and their data from each other in cases when scripts handle sensitive data. ([arch-security-consideration-isolation-sensitive](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-isolation-sensitive))

- [ ] 33. Similarly, the WoT Runtime implementation SHOULD perform isolation of WoT Runtime instances and their data from each other if a WoT device has more than one tenant. ([arch-security-consideration-isolation-tenants](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-isolation-tenants))

#### 10.2.2 Physical Device Direct Access Risk

- [ ] 34. The WoT Runtime SHOULD NOT directly expose low-level device hardware interfaces to the script developers. ([arch-security-consideration-avoid-direct](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-avoid-direct))

- [ ] 35. A WoT Runtime implementation SHOULD provide a hardware abstraction layer for accessing the low-level device hardware interfaces. ([arch-security-consideration-use-hal](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-use-hal))

### 10.3 WoT Runtime Risks

#### 10.3.1 Provisioning and Update Security Risk

- [ ] 36. Post-manufacturing provisioning or update of scripts, the WoT Runtime itself or any related data SHOULD be done in a secure fashion. ([arch-security-consideration-secure-update](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-secure-update))

#### 10.3.2 Security Credentials Storage Risk

- [ ] 37. The WoT Runtime SHOULD securely store any provisioned security credentials, guaranteeing their integrity and confidentiality. ([arch-security-consideration-secure-cred-storage](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-secure-cred-storage))

  - B (https://w3c.github.io/wot-security/#wot-threat-model-assets)

- [ ] 38. In case there are more than one tenant on a single WoT-enabled device, a WoT Runtime implementation SHOULD isolate each tenant's provisioned security credentials from other tenants. ([arch-security-consideration-secure-cred-isolation](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-secure-cred-isolation))

  - B (https://w3c.github.io/wot-security/#wot-threat-model-stakeholders)

- [ ] 39. In order to minimize a risk that provisioned security credentials get compromised, the WoT Runtime implementation SHOULD NOT expose any API for scripts to query provisioned security credentials. ([arch-security-consideration-no-expose-cred](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-no-expose-cred))

  - B (https://w3c.github.io/wot-security/#wot-threat-model-assets)

- [ ] 40. Such credentials (or even better, abstract operations that use them but do not expose them) SHOULD only be accessible to the underlying protocol implementation that uses them. ([arch-security-consideration-limit-cred-access](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-limit-cred-access))
  - B (https://w3c.github.io/wot-security/#wot-threat-model-assets)

### 10.4 Trusted Environment Risks

- [ ] 41. Trust relationships SHOULD be as restricted as possible, ideally pairwise and limited to precisely the access required. ([arch-security-consideration-limit-trust](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-limit-trust))

  - B (https://w3c.github.io/wot-security/#wot-threat-model-assets)

- [ ] 42. In the case of implicit access control via access to a common network a segmented network SHOULD be used. ([arch-security-consideration-segmented-network](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-segmented-network))
  - B (https://w3c.github.io/wot-security/)

### 10.5 Secure Transport

- [ ] 43. When a Thing is made available on the public internet so it can be accessed by anyone, from anywhere, then it MUST be protected by secure transport such as TLS or DTLS. ([arch-security-consideration-tls-mandatory-pub](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-tls-mandatory-pub))

  - B (https://w3c.github.io/wot-security/#sec-pract-system-user-data)

- [ ] 44. When a Thing is made available on a private network then it SHOULD be protected by secure transport such as TLS or DTLS. ([arch-security-consideration-tls-recommended-priv](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-tls-recommended-priv))

  - B (https://w3c.github.io/wot-security/#sec-pract-system-user-data)

- [ ] 45. Private networks such as a LAN, protected by a firewall, MAY use the Trusted Environment approach of depending on network security only. ([arch-security-consideration-tls-optional-on-lan](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-tls-optional-on-lan))

  - B (https://w3c.github.io/wot-security/)

- [ ] 46. When secure transport over TCP is appropriate, then at least TLS 1.3 [RFC8446] SHOULD be used. ([arch-security-consideration-tls-1-3](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-tls-1-3))

- [ ] 47. If TLS 1.3 cannot be used for compatibility reasons but secure transport over TCP is appropriate, TLS 1.2 [RFC5246] MAY be used. ([arch-security-consideration-tls-1-2](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-tls-1-2))

- [ ] 48. If DTLS 1.3 cannot be used for compatibility reasons but secure transport over UDP is appropriate, then DTLS 1.2 [RFC6347] MAY be used. ([arch-security-consideration-dtls-1-2](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-dtls-1-2))

- [ ] 49. Versions of DTLS or TLS earlier than 1.2 MUST NOT be used for new development. ([arch-security-consideration-no-earlier-tls-or-dtls](https://www.w3.org/TR/wot-architecture11/#arch-security-consideration-no-earlier-tls-or-dtls))

## 11. Privacy Considerations

### 11.1 WoT Thing Description Risks

#### 11.1.1 Thing Description Personally Identifiable Information Risk

- [ ] 50. Storage of explicit PII in TDs SHOULD be minimized as much as possible. ([arch-privacy-consideration-min-explicit-pii](https://www.w3.org/TR/wot-architecture11/#arch-privacy-consideration-min-explicit-pii))

- [ ] 51. TDs that can be associated with a person SHOULD generally be treated as if they contained PII and subject to the same management policies as other PII, even if they do not explicitly contain it. ([arch-privacy-consideration-explicit-pii](https://www.w3.org/TR/wot-architecture11/#arch-privacy-consideration-explicit-pii))

- [ ] 52. Distribution mechanisms for TDs SHOULD ensure they are only provided to authorized Consumers. ([arch-privacy-consideration-dist-td-auth](https://www.w3.org/TR/wot-architecture11/#arch-privacy-consideration-dist-td-auth))

### 11.2 Access to Personally Identifiable Information

- [ ] 53. Things returning data or metadata (such as TDs) associated with a person SHOULD use some form of access control. ([arch-privacy-consideration-access-control-mandatory-person](https://www.w3.org/TR/wot-architecture11/#arch-privacy-consideration-access-control-mandatory-person))

- [ ] 54. Services returning Thing Descriptions with immutable IDs SHOULD use some form of access control. ([arch-privacy-consideration-id-access-control-mandatory-immutable](https://www.w3.org/TR/wot-architecture11/#arch-privacy-consideration-id-access-control-mandatory-immutable))
