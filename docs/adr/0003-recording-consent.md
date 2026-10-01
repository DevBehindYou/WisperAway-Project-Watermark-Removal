# ADR 0003: Consent for recording meeting and call participants

**Status:** Proposed — reasonable default, revisit if it creates real friction

## Context

The spec's microphone-privacy design (Sections 35–39) is thorough about *your own* consent — explicit modes, a visible indicator, no silent background capture. It's silent on the person on the other end of a Meet call, phone call, or in-person conversation, who is also being recorded and having their words extracted into a commitment ledger, generally without being asked. Section 101's risk register names "audio consent" as a risk but doesn't resolve it. Consent-to-record requirements vary by jurisdiction, and the work here is async across time zones with clients who could be located anywhere.

Resolving this precisely, jurisdiction by jurisdiction, isn't practical before Phase 3/4 start. A simple, conservative default is.

## Decision

Default to a standard spoken disclosure at the start of any session where Meet transcription or desktop voice capture is active and another person is present — something as simple as "mind if I record this for my notes?" No silent capture of another participant, in any mode, regardless of jurisdiction. If a client or teammate objects, that relationship falls back to manual note-taking only — meeting-mode capture is opt-in per relationship, not a blanket default once it's turned on generally.

## Consequences

- Simple enough to implement immediately — it's a habit and a UI reminder, not a legal research project.
- Conservative by design: it satisfies the strictest plausible jurisdictional requirement rather than the loosest, so it doesn't need revisiting every time a new client is in a new location.
- Slight friction of having to ask every time, which is the right trade for not having to resolve consent law by country before Phase 3 can start.
- If this becomes a real point of friction with clients (some may find it odd to be asked repeatedly), revisit with something lighter — e.g., a one-time disclosure per client relationship instead of per session.
