# ADR 0002: The experimental WhatsApp Web reader (Mode D)

**Status:** Proposed — **needs your explicit confirmation, this is a product trade-off, not a technical one**

## Context

The spec's WhatsApp strategy (Section 57) already correctly separates reliable modes (A: share-into-app, C: personal handoff) from a marked-experimental one (D: a read-only WhatsApp Web reader via computer-use automation).

Mode D deserves a harder look than "experimental." WhatsApp's own guidelines prohibit scraping and unofficial-client automation outright — the restriction isn't conditioned on whether anything gets sent, just on interacting with the service that way at all. If this runs against a real personal number with any regularity, the realistic outcome isn't "might get flagged" — it's "eventually will." The cost of losing that number (also presumably used for client contact) is out of proportion to what Mode D adds on top of Modes A and C.

## Decision

Drop Mode D from the build entirely for now. Ship with Modes A and C only, which cover the reliable, user-initiated capture surface. If those prove insufficient in practice after real use, revisit Mode D — and if it's ever built, only against a secondary number that can be lost without real cost, never the primary line.

## Consequences

- Slightly less automatic WhatsApp capture than the full spec originally envisioned — some commitments made over WhatsApp will only enter the system when actively shared in (Mode A) or via the notification-listener mode (Mode B, still fine to build — it's local-only and doesn't touch WhatsApp's own systems).
- Removes a real, asymmetric risk (account loss) in exchange for a capture mode that was already marked unsupported.
- **This is the one open decision in this batch most worth pushing back on if you disagree** — it's a genuine product call about how much WhatsApp coverage matters to you, not something that has one obviously correct technical answer.
