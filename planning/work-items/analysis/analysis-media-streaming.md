# Media Streaming Analysis

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/streaming)

In this document, "Streaming" refers to media streaming, such as the continuous delivery of audio, video, or similar time-sensitive media over one or more protocols.
It does not include chunked transfer of large files, pagination, or other mechanisms for segmented
delivery of content.
A streaming solution may use reliable or unreliable transport, and may involve encryption, session control, or other metadata needed to start, maintain, or stop the stream.

This analysis focuses on what additional Thing Description infrastructure, if any, is needed to describe streaming-related affordances and bindings in a generic way.
This may include vocabulary terms, interaction patterns, or protocol-specific metadata needed for stream publication, subscription, or session management.

Because the required infrastructure is not yet clear, this work item should also examine one or more concrete streaming protocol bindings, such as [RTSP](https://w3c.github.io/wot-charter-drafts/wot-wg-2023-details.html#rtsp-binding-workitem), to validate the assumptions and narrow the scope.

## Open questions

- How can TD indicate that an affordance exposes a continuous stream rather than a finite payload?
- Should streaming be modeled as a new affordance pattern or as metadata on existing affordances?
- If a Thing can receive or be written with a stream, how should TD describe that capability?
- Which parts of streaming description belong in TD vocabulary, and which belong in protocol binding metadata?

## Related Issues

- Adding term to indicate a stream of data: https://github.com/w3c/wot-thing-description/issues/1044
  - Discusses whether TD should have an explicit way to indicate that an affordance exposes a continuous stream rather than a finite or bulk payload.
- Use case for TD to describe media streaming protocols: https://github.com/w3c/wot-usecases/issues/13
  - Use case for describing audio/video streaming protocols in TD, especially for media player scenarios.
- Video, Audio treatment: https://github.com/w3c/wot-architecture/issues/8
  - Architectural discussion about how to handle large-volume continuous media in WoT.
- Variants of VR/AR guide use case: https://github.com/w3c/wot-usecases/issues/83
  - Describes how streaming video or sensor data may be mapped into VR/AR scenarios with spatial metadata.

## User Stories

### Consume a Media Stream Exposed by a Thing

- **Who:** Developer of a Consumer or system integrator
- **What:** Determine how to receive a continuous audio or video stream exposed by a Thing, including the endpoint, media type, and protocol-specific information needed to establish the stream
- **Why:** So that the Consumer can select a supported representation and consume the stream without relying on out-of-band documentation
- **Sentence:** **As a** developer of a Consumer, **I need** to describe how a Thing exposes a media stream **so that I can** establish and consume the stream using a protocol and media format supported by my application.
- **Process Stakeholders:**
  - Submitter: WoT WG/extended community
  - Specification Writers: TBD
  - Implementation Volunteers: TBD
  - Impacted People: TD designers and Consumer application developers
  - Impact Type: Enable interoperable consumption of media streams from Things without protocol-specific out-of-band information; may increase TD authoring and Consumer implementation complexity where stream characteristics or protocol-specific metadata must be described and processed
- **Linked Use Cases or Categories:**
  - [Use case for TD to describe media streaming protocols](https://github.com/w3c/wot-usecases/issues/13)
  - [Video, Audio treatment](https://github.com/w3c/wot-architecture/issues/8)
  - [Variants of VR/AR guide use case](https://github.com/w3c/wot-usecases/issues/83)

#### Scenarios

- A Consumer displays a live video stream exposed by a security camera.
- A virtual guide discovers and plays a live video or audio stream associated with a point of interest.
- A Consumer selects one of multiple representations of the same media stream based on the protocols and media formats it supports.

### Send a Media Stream to a Thing

- **Who:** Developer of a Consumer or system integrator
- **What:** Determine how to send a continuous audio or video stream to a Thing that acts as a media sink
- **Why:** So that media players, speakers, displays, and similar Things can accept media from interoperable Consumers
- **Sentence:** **As a** developer of a Consumer, **I need** to describe how a Thing accepts a media stream **so that I can** send media to it using a supported protocol and media format.
- **Process Stakeholders:**
  - Submitter: WoT WG/extended community
  - Specification Writers: TBD
  - Implementation Volunteers: TBD
  - Impacted People: TD designers, Thing implementers, and Consumer application developers
  - Impact Type: Enable interoperable delivery of media streams to Things without protocol-specific out-of-band information; may increase Thing and Consumer implementation complexity due to long-lived input, flow control, resource management, and stream termination
- **Linked Use Cases or Categories:**
  - [Use case for TD to describe media streaming protocols](https://github.com/w3c/wot-usecases/issues/13)
  - [Adding term to indicate a stream of data](https://github.com/w3c/wot-thing-description/issues/1044)

#### Scenarios

- A Consumer sends an audio stream to a network speaker.
- A Consumer sends a video stream to a display or generic media player.
- A Consumer sends live microphone audio to a Thing for real-time processing.

### Establish a Bidirectional Media Session

- **Who:** Developer of a Consumer or system integrator
- **What:** Determine how to establish a session in which a Thing and a Consumer exchange media streams in both directions
- **Why:** So that interactive Things can support real-time communication without requiring an application-specific description of the session
- **Sentence:** **As a** developer of a Consumer, **I need** to describe bidirectional media communication **so that I can** establish and maintain an interactive media session with a Thing.
- **Process Stakeholders:**
  - Submitter: WoT WG/extended community
  - Specification Writers: TBD
  - Implementation Volunteers: TBD
  - Impacted People: TD designers, Thing implementers, and Consumer application developers
  - Impact Type: Enable interoperable interactive media sessions while allowing existing media protocols to define transport and negotiation details; may significantly increase TD authoring and implementation complexity due to session negotiation, simultaneous media flows, lifecycle management, and failure handling
- **Linked Use Cases or Categories:**
  - [Adding term to indicate a stream of data](https://github.com/w3c/wot-thing-description/issues/1044)
  - [Video, Audio treatment](https://github.com/w3c/wot-architecture/issues/8)

#### Scenarios

- A Consumer exchanges live audio with a network intercom.
- A Consumer sends microphone audio to a voice-enabled Thing while receiving an audio response.

### Control a Media Stream or Session

- **Who:** Developer of a Consumer or system integrator
- **What:** Identify the interactions used to start, stop, pause, resume, or otherwise control a media stream or session
- **Why:** So that the Consumer can coordinate media delivery with the state and capabilities of the Thing
- **Sentence:** **As a** developer of a Consumer, **I need** to describe the controls associated with a media stream **so that I can** manage the stream or session correctly.
- **Process Stakeholders:**
  - Submitter: WoT WG/extended community
  - Specification Writers: TBD
  - Implementation Volunteers: TBD
  - Impacted People: TD designers, Thing implementers, and Consumer application developers
  - Impact Type: Clarify how media delivery and its associated controls are represented together in a TD; may increase TD modeling and Consumer implementation complexity where controls, session state, and media endpoints must be associated and kept consistent
- **Linked Use Cases or Categories:**
  - [Use case for TD to describe media streaming protocols](https://github.com/w3c/wot-usecases/issues/13)
  - [Video, Audio treatment](https://github.com/w3c/wot-architecture/issues/8)

#### Scenarios

- A Consumer starts and stops a live camera stream.
- A Consumer selects a media resource and controls playback on a media player.
- A Consumer terminates an interactive audio session and releases its associated resources.

## Existing Solutions and Ideas

The examples in this section are an initial collection and are not exhaustive.
Other implementations, description models, and media streaming technologies need to be investigated before drawing conclusions or deriving requirements.

### Existing Solution: WebThings Video Properties

The [WebThings capability schemas](https://webthings.io/schemas/#VideoProperty) model a video camera using a required read-only `VideoProperty`.
The property has no primitive data type (`type` is `null` or omitted), and links with a media type identify binary representations of the video resource.

In the discussion of [wot-thing-description issue 1044](https://github.com/w3c/wot-thing-description/issues/1044#issuecomment-2523003810), a WebThings Gateway implementation is described as modeling a video stream as a Property whose Form `contentType` identifies the streaming video format.

This example demonstrates that a media source can be modeled using an existing affordance type and media-type metadata when the protocol and content type already identify the resource as a stream.
It does not establish that this approach covers all media sources, media sinks, bidirectional sessions, or protocols in the user stories above.

### Ideas Discussed in Related Issues

The following ideas have been raised in issue comments:

- Model a video stream as an Event, particularly when multicast delivery is involved ([discussion](https://github.com/w3c/wot-thing-description/issues/1044#issuecomment-2520847442)).
- Model an HLS resource as a Property whose Form uses `application/vnd.apple.mpegurl` as its `contentType` ([discussion](https://github.com/w3c/wot-thing-description/issues/1044#issuecomment-2522507472)).
- Model continuous bidirectional audio as separate read-only and write-only Properties, while using an Action when the input and output are discrete audio files ([discussion](https://github.com/w3c/wot-thing-description/issues/1044#issuecomment-2523003810)).
- Model media playback and its controls with Properties and Actions, as explored in the [WebThings `MediaPlayer` capability discussion](https://github.com/WebThingsIO/schemas/issues/34#issuecomment-786641538).

These ideas are recorded as inputs to the analysis, not as agreed designs or feature proposals.

### Further Investigation

Common and emerging streaming protocols and description models include the following.

#### Streaming Protocols

- [RTSP](https://www.rfc-editor.org/rfc/rfc7826) controls continuous media delivery, while [RTP](https://www.rfc-editor.org/rfc/rfc3550) carries real-time media. Together, they are relevant to media endpoints and their controls. (URI: `rtsp://host/path` or `rtsps://host/path`)
- [WebRTC](https://www.rfc-editor.org/rfc/rfc8825) supports negotiated, secure, and bidirectional real-time media sessions between endpoints. (URI: no dedicated URI scheme)
- [HTTP Live Streaming (HLS)](https://www.rfc-editor.org/rfc/rfc8216) and [MPEG-DASH](https://www.mpeg.org/standards/MPEG-DASH/) deliver segmented media over HTTP and use playlists or media presentation descriptions to select representations. (no dedicated HLS/MPEG-DASH URI scheme. Identify the protocol using `contentType`.)
- [WebRTC-HTTP Ingestion Protocol (WHIP)](https://www.rfc-editor.org/rfc/rfc9725) standardizes HTTP and SDP-based establishment of a WebRTC session for ingesting media into a media sink. (no dedicated WHIP URI scheme)
- [WebRTC-HTTP Egress Protocol (WHEP)](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/) defines the corresponding establishment of a WebRTC session for receiving media from a media source. As of August 2026, it remains an Internet-Draft. (no dedicated WHEP URI scheme)
- [Media over QUIC Transport (MOQT)](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/) is an Internet-Draft defining publish/subscribe media delivery over QUIC or WebTransport. Its publication and subscription models apply to both media sources and media sinks. (URI: `moqt://host/path`)

#### Description Models

- [Session Description Protocol (SDP)](https://www.rfc-editor.org/rfc/rfc8866) describes multimedia sessions, including media formats and transport addresses.
- [MOQT Streaming Format (MSF)](https://datatracker.ietf.org/doc/draft-ietf-moq-msf/) defines a JSON-based catalog describing available MOQT media tracks and their characteristics. MSF remains an Internet-Draft.
- [ONVIF Network Interface Specifications](https://www.onvif.org/profiles/specifications/) describe media configurations and stream URI retrieval for network media devices.
- [SMIL 3.0](https://www.w3.org/TR/smil/) describes the composition, timing, and synchronization of multimedia presentations.


## Summarized Problem

Will be done after collecting the user stories and all related issues

## Requirements

Will be done after everything else
