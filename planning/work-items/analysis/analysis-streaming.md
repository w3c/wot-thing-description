# [DRAFT] Streaming Analysis

![GitHub labels](https://img.shields.io/github/labels/w3c/wot-thing-description/streaming)

Streaming refers to the continuous delivery of time-sensitive data such as audio, video, or similar media over one or more protocols.
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

TBD

This section will follow the same format used in other analysis documents.
- **Who:** The intended role or stakeholder
- **What:** The capability or behavior they need
- **Why:** The reason the capability matters
- Sentence: A short "**As a** ... **I need** ... **so that I can** ..." summary
- Process Stakeholders
- Linked Use Cases or Categories

## Existing Solutions

TBD
- Identify representative streaming protocols and existing descriptions if available.
  - RTSP, HLS, DASH, MSE, and WebRTC are candidate references, but the analysis should distinguish between protocol families and actual TD-level needs.

## Summarized Problem

Will be done after collecting the user stories and all related issues

## Requirements

Will be done after everything else
