# ADR 0001: Google OAuth token lifecycle for a personal-account deployment

**Status:** Proposed — technical default, low stakes to change later

## Context

The ingestion pipeline depends on Gmail, Calendar, and Meet scopes, all via Google OAuth. For a personal Gmail account (no Workspace organization behind it), there is no "Internal" publishing status — that option only exists for apps tied to a Workspace org. That leaves two paths:

- Stay in **Testing** (unverified) status. Simple to set up, but Google expires a test user's authorization — including any refresh token for scopes beyond basic profile access — seven days after they consent.
- Go through **verification**. Removes the 7-day expiry, but requires a privacy policy, a demo, and for sensitive/restricted scopes (which Gmail and Meet both are) likely a third-party security assessment. Real cost and a multi-week timeline, disproportionate for a single user at this stage.

Without a decision, this silently breaks ingestion every week and looks like a mysterious outage rather than an expected event.

## Decision

Stay in Testing status for now. Build the re-consent flow as a first-class, expected part of the system rather than an edge case:

- Treat weekly re-authorization as a scheduled event in the integration-health system (spec Section 84), not a failure state.
- Surface it as a simple, low-friction nudge ("Gmail access needs a quick refresh") rather than a cryptic error.
- Revisit verification once there's a concrete reason to need it — a second user, or a decision to productize this beyond personal use.

## Consequences

- Adds a small recurring piece of friction: roughly once a week, a notification and one click.
- Avoids verification cost and timeline entirely for now.
- The integration-health dashboard and watchdog nudges (Sections 80–81 of the spec) need to distinguish "expected weekly re-auth" from "something is actually broken" — worth being explicit about this distinction in whatever monitoring gets built in Phase 2.
- If this project is later opened to more than one user, this decision needs to be revisited before that happens, not after.
