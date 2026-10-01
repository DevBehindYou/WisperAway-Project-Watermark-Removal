# ADR 0004: Personal-only scope vs. day-one multi-tenancy

**Status:** Proposed — **needs your explicit confirmation; this one deviates from the original spec and shouldn't be accepted by default**

## Context

`docs/PRODUCT_SPEC.md`, Section 11, explicitly instructs building multi-tenancy — every multi-user table carrying a tenant reference, row-level security — "from day one even if the first deployment has one organization." That's a defensible instinct if this is meant to eventually be offered to other people or clients, the way other projects (APEX, the Financial Intelligence Engine) have been positioned as productizable. It's real infrastructure cost — schema complexity, RLS policy work, cross-tenant isolation testing — for a feature with exactly one user for the foreseeable future if this stays personal.

Per the spec's own Section 105 rule ("if documentation conflicts with this specification, document the conflict, then use the current supported approach"), this ADR is flagging a proposed conflict rather than silently overriding the original instruction.

## Decision (proposed — not yet confirmed)

Build Phase 1 single-tenant: no row-level security overhead, no tenant table plumbed through every entity yet. Structure the schema so tenancy could be retrofitted later without a full rewrite (a `tenant_id` column reserved but unenforced is a reasonable middle ground, if you want the cheap version of both worlds), but don't build and test full RLS isolation until there's a concrete second user or a real plan to offer this beyond personal use.

## Consequences if confirmed as-is

- Meaningfully faster Phase 1 — less schema complexity, no tenant-isolation test suite to write and maintain for a feature nobody's using yet.
- Real migration cost later if this does become multi-tenant — retrofitting RLS onto a live schema with real data is more work than building it in from the start would have been.
- Directly contradicts the original spec's Section 11 instruction, so this needs a real yes from you, not a default acceptance along with the other three ADRs in this batch.

## Alternative

Keep the original instruction as written — build multi-tenant from day one, accept the added Phase 1 cost now in exchange for never having to retrofit it. Equally legitimate; this ADR just isn't proposing it as the default, for the reasons above.
