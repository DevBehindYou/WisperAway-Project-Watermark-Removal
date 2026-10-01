# STATE — Personal Chief of Staff / Commitment Intelligence System

Last updated: 2026-09-20

Update this file at the end of **every session**, not just every phase. If you're an AI agent starting a new session, this file — not chat history — is the source of truth for where things stand.

## Current phase

**Phase 0/1 overlap, narrowing.** The evaluation harness now exists and its scorer is proven correct — but it has no live model to evaluate yet, so Phase 0 still isn't formally exited per spec §98's own rule (no real extraction-accuracy numbers, only test-double numbers proving the *scorer* works). The Phase 1 commitment-core slice, meanwhile, has real, running, tested code — API included — well ahead of that gate. Being honest about that overlap rather than pretending the gate was respected.

## Done — and actually proven, not just described

- Full product spec committed (`docs/PRODUCT_SPEC.md`)
- Phase 0 kickoff brief (`PHASE0_KICKOFF_BRIEF_PLAIN.md`)
- Draft ADRs 0001–0004 (`docs/adr/`) — **still pending your explicit confirmation**, especially 0002 (WhatsApp Mode D) and 0004 (tenancy scope)
- `UI_UX_DESIGN_SYSTEM.md` — the Keystone design system
- `packages/date-resolution` — deterministic date engine, 23 real tests passing, covers the full spec §95 phrase list plus Sunday/Monday, month-end, year-end, and real 2026 DST boundary cases
- `services/api/src/db/schema.ts` — Phase 1 schema (13 tables), pushed to and verified against a live PostgreSQL 16 instance
- `services/api/src/smoke.ts` — real end-to-end run proving the manual-capture path (SourceEvent → dual date resolution → Candidate → accepted Commitment → append-only ledger, including a client-initiated date change) against real data in a real database. This is the literal proof of spec §99's Phase 1 exit line.
- `services/api/src/routes/commitments.ts` + `src/index.ts` — a real, running Fastify HTTP API over that same schema: capture, create/list/accept/reject candidates, list/read commitments with their full ledger, record a due-date change. Zod-validated bodies.
- `services/api/src/routes/setup.ts` — tenant/client-account/person creation and listing, over real HTTP. Closes last pass's "hand-seeded in tests" gap.
- `services/api/src/http-smoke.ts` — real end-to-end run over actual HTTP (Fastify `.inject()`), proving: a normal candidate resolves correctly; a deliberately ambiguous phrase ("after the client call") routes to `NEEDS_DATE_REVIEW` instead of getting guessed; accepting the same candidate twice returns 409 instead of silently duplicating; a client-initiated due-date change produces a second, distinct ledger row read back correctly over the API.
- `evals/` — a real, tested evaluation harness: 5 hand-written fixtures + hand-written expected answers, a scorer implementing spec §30's metrics exactly, and 3 passing tests proving the scorer's arithmetic against independently hand-tallied numbers (71.4% precision, 100% recall, 80% date/owner/promised-to accuracy on the current test-double run). See `docs/EXTRACTION_EVALUATION.md` — the harness is real, but there's no live model to actually evaluate yet, so these numbers are proof the *scorer* works, not a measure of real extraction quality.
- `apps/web` — the Review Queue screen, real and tested: tabs (spec §28), candidate cards whose shape/color follow the design doc's rules, and a real Evidence Panel pulling the actual verbatim source text over HTTP (`GET /source-events/:id`, added this pass — didn't exist before). 4 component tests pass, production build is clean. No live-browser proof — this sandbox has no working browser and doesn't keep background dev servers alive between tool calls; proven by build + component tests instead.
- `GET /workspace` — an idempotent single-tenant bootstrap (called twice in `http-smoke.ts`, proven to return the same tenant both times), replacing `apps/web`'s earlier localStorage-tenant-minting, which could silently fork into a second, disconnected workspace. Deliberately not a login/session layer — see the note in `services/api/src/services/setup.ts` for why that would be over-building while ADR 0004 keeps this single-tenant.
- `POST /commitments/:id/waiting` + `GET /waiting-items` — real WAITING-state handling (spec §18), proven in `http-smoke.ts`: marking a commitment WAITING creates a real `waiting_items` row (joined to its commitment for tenant scoping, since that table has no `tenant_id` of its own) and a third ledger entry.
- `apps/web`'s **Dashboard** page — Open commitments and Waiting-on-others zones, both backed by real data, with a visible on-page note (not a silent omission) that "At Risk" and "Personal Goals" aren't built rather than showing them as empty placeholder sections. 3 component tests, including one that specifically checks there's no fake "At Risk" section heading. Simple nav added to `App.tsx` to switch between Dashboard and Review Queue — no router library, not needed yet for two screens.
- Client/person hint resolution on accept — `acceptCandidate` now matches a candidate's `clientHint`/`promisedToHint` text against real `client_accounts`/`persons` records (exact case-insensitive name match) and links the real foreign keys, instead of leaving them null. This is a real gap fix, not a feature add: without it, commitments could never be grouped by client at all. Proven in `http-smoke.ts`.
- `GET /client-accounts/:id/view` + `apps/web`'s **Client View** page (design doc §5.6) — a client picker and the accountability ledger read as one chronological, immutable timeline joined across every one of that client's commitments (not just one commitment's own ledger, which was the only view that existed before). Proven two ways: the backend smoke test checks the client-joined timeline has the exact same entry count as the single-commitment ledger it's built from; 3 component tests check both attribution directions render correctly and that switching clients shows an honest empty state rather than stale data.

- `infrastructure/backups/` — real encrypted backup + guarded restore, proven by a real round trip into a fresh database with identical row counts (`docs/BACKUPS.md`). Second-location copy and scheduling are not proven/built.
- First `npm audit` pass (`docs/SECURITY.md`): drizzle-orm SQLi advisory fixed (not exploitable as written, upgraded anyway, all suites re-verified). vitest/vite dev-tooling advisories deliberately deferred. New known issue: `drizzle-kit push` broken after the upgrade.

## Environment note

Mid-session, this working directory came back partly reset: `.git` was gone and the web Search page, its API-client wiring, tests and the Search steps in `http-smoke.ts` had vanished, while the backend search code survived. I rebuilt the missing pieces and re-proved them. **Git history before this point is lost** — the repo was re-initialised with one baseline commit.

## In progress

- Nothing mid-build right now — everything above either fully works or is explicitly marked not-started below.

## Not started

- Calendar, Search, and every other screen in `UI_UX_DESIGN_SYSTEM.md` besides Review Queue, Dashboard, and Client View
- Real risk calculation (spec §21's capacity check) — Dashboard's "At Risk" zone is honestly absent rather than faked because this doesn't exist yet
- The Goal entity (spec §33, a Phase 6 concern) — Dashboard's "Personal Goals" zone is absent for the same reason
- Real auth/login — not built, and not the right next move either, until ADR 0004 actually goes multi-tenant (see `GET /workspace`'s note above)
- The evaluation harness's fixture set is a starting point (5), not a corpus — no near-duplicate fixtures, no noisy-transcript fixtures, no multi-source evidence case yet
- Real matching/similarity logic (spec §27) — the harness currently sidesteps this by having its test extractor tag its own matches; a real model's raw output can't be scored until this exists
- Any live model call — no LLM credentials available in this build environment, so neither the smoke tests nor the eval harness have ever called a real model
- Any external integration (Gmail, Calendar, Meet, WhatsApp) — all blocked on ADR 0001 confirmation for Gmail/Calendar/Meet, and on ADR 0002 for WhatsApp
- Row-Level Security / tenant isolation enforcement — `tenant_id` columns exist, nothing enforces them, per ADR 0004's proposed (unconfirmed) default
- The reuse audit against Clone Micro AI and Atomic Vault/Nexus CRM Android — still no live access to those repos from this environment

## Known gaps / blockers

- This build environment has no LLM API credentials and no ability to install/run a local model — real model-adapter work and the evaluation harness's actual precision/recall numbers need an environment that has both.
- No GitHub remote connected yet — this repo exists locally in a sandboxed container and gets handed off as a zip, not pushed anywhere. Worth setting up a real remote before this grows much further, so history isn't lost between sessions.

## Next up

Phase 1's buildable-without-external-dependencies scope is now essentially done. What's left either needs something this environment doesn't have, or needs a decision only you can make:

1. Get ADRs 0001/0002/0004 real answers, not defaults inherited by silence — 0001 in particular gates all of Phase 2 (Gmail/Calendar/Meet).
2. Grow the eval fixture set past 5, and add the fuzzy-matching layer (spec §27) that's currently sidestepped — buildable here, no dependencies, and a prerequisite for scoring a real model instead of the test double.
3. Once there's an environment with real LLM credentials: build an actual ModelAdapter (spec §31), point the eval runner at it, and get Phase 0's real exit numbers — written by someone other than whoever tunes the model, per the contamination note in `docs/EXTRACTION_EVALUATION.md`.
4. Phase 2 (Gmail/Calendar ingestion, nudges, capacity) — blocked on ADR 0001 *and* on real Google OAuth credentials, neither of which exist in this environment.
5. Calendar, Capacity, Briefs, Settings/Integrations, and "What My Assistant Knows" screens from the design doc all depend on Phase 2 or Phase 6 backend that doesn't exist — building the screens first would mean faking their data.
