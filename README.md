# Keystone

Personal Chief of Staff / Commitment Intelligence System. See `docs/PRODUCT_SPEC.md` for the full spec and `PHASE0_KICKOFF_BRIEF_PLAIN.md` for how this got started.

## What's real right now

This is early Phase 1. Here's exactly what's built and proven, versus described:

| Piece | Status |
|---|---|
| `packages/date-resolution` | **Real, tested.** Deterministic date-resolution engine per spec §4.2/§95. 23 tests, all passing, covering the full phrase list plus Sunday/Monday boundaries, month-end, year-end, and real 2026 DST transitions (verified against actual US DST dates, not assumed ones). |
| `services/api/src/db/schema.ts` | **Real, pushed to a live Postgres.** The Phase 1 entity set from spec §11 (13 tables), scoped per §98's Phase 1 definition and `docs/adr/0004`'s proposed single-tenant default. |
| `services/api/src/smoke.ts` | **Real, run successfully.** End-to-end proof of the manual-capture path: SourceEvent → deterministic date resolution → CommitmentCandidate → accepted Commitment → append-only ledger, including a second, client-initiated date change with its own ledger row. This is the literal proof for spec §99's Phase 1 exit line: "every accepted commitment is traceable to evidence." Run it yourself with `npm run smoke -w services/api` against a local Postgres. |
| `services/api/src/routes/setup.ts` | **Real, running.** `GET /workspace` (idempotent single-tenant bootstrap — added this pass, see below), `POST/GET /tenants`, `/client-accounts`, `/persons`. |
| `services/api/src/routes/commitments.ts` + `src/index.ts` | **Real, running Fastify API.** `POST /source-events`, `POST /candidates`, `GET /candidates`, `POST /candidates/:id/accept`, `POST /candidates/:id/reject`, `GET /commitments`, `GET /commitments/:id`, `POST /commitments/:id/due-date`, `POST /commitments/:id/waiting`, `GET /waiting-items`, `GET /client-accounts/:id/view`. Zod-validated request bodies (spec §107's runtime-validation requirement). Accepting a candidate now also resolves its `clientHint`/`promisedToHint` text against real client/person records (exact-name match, not full identity resolution — see the note in `services/commitments.ts`), which is what makes Client View possible at all. |
| `services/api/src/http-smoke.ts` | **Real, run successfully.** Drives the actual HTTP routes (via Fastify's `.inject()`, real request/response objects) through setup (tenant/client/person, now over HTTP too) → capture → a normal candidate → a deliberately ambiguous one (proves it routes to `NEEDS_DATE_REVIEW` instead of guessing) → review list → accept → a rejected double-accept (409, not a silent duplicate) → a client-initiated due-date change → the full ledger read back. Run with `npm run smoke:http -w services/api`. |
| `services/api/src/routes/search.ts` + `services/search.ts` | **Real, running.** `GET /search` — genuine Postgres full-text search (`to_tsvector`/`plainto_tsquery`) across commitments and source events. No natural-language query interpretation and no embeddings (no model available here to do that honestly): keyword search only. Every result carries its source citation; a non-matching query returns nothing. Proven in `http-smoke.ts`. |
| `evals/` | **Real, tested, honestly scoped.** 5 hand-written fixtures with hand-written expected answers, a scorer implementing spec §30's exact metrics, and a runner — but no live model in this environment, so it currently runs against a test double, not a real extractor. See `docs/EXTRACTION_EVALUATION.md` for exactly what that does and doesn't prove. |
| `apps/web` | **Real, tested, builds cleanly.** Four screens behind a simple nav (no router library): **Review Queue**, **Dashboard**, **Client View** (client picker + the accountability ledger as one immutable chronological timeline, joined across that client's commitments) and **Search** (real keyword search; every result shows its literal source citation; honest empty state). Wired to the real API through a Vite dev proxy, not mocked data. 12 component tests passing, production build succeeds. No live-browser screenshot — see the sandbox note below. |
| Other UI | **Calendar and everything else in `UI_UX_DESIGN_SYSTEM.md` beyond the four screens above are not built.** |
| Any external integration (Gmail, Calendar, Meet, WhatsApp) | **Not built.** Phase 2+. Also blocked on `docs/adr/0001` (OAuth token lifecycle) actually being confirmed, not just proposed. |
| Any live model call | **Not built.** The smoke test simulates "the model agreed" with a hardcoded stand-in, and the eval harness runs against a labeled test double — no live model call anywhere yet. This environment has no LLM credentials to call one for real; that's an honest gap, not a hidden one. |
| Row-Level Security / real multi-tenancy | **Not built**, deliberately, per `docs/adr/0004`'s proposed default. `tenant_id` exists on every table; nothing enforces it yet. |

## Running it yourself

```bash
# from repo root
npm install

# date-resolution tests
npm test -w packages/date-resolution

# eval harness scorer tests
npm test -w evals/runner

# web app: component tests + production build
npm test -w apps/web
npm run build -w apps/web

# to actually run the full stack yourself (needs two terminals):
npm run start -w services/api   # terminal 1 — API on :3000
npm run dev -w apps/web         # terminal 2 — app on :5173, proxies /api to :3000

# push schema to your own Postgres (set DATABASE_URL in services/api/.env first —
# see .env.example)
npm run db:push -w services/api

# run the end-to-end proofs
npm run smoke -w services/api        # DB layer
npm run smoke:http -w services/api   # HTTP layer

# run the actual server
npm run start -w services/api        # listens on :3000
```

Note from building this in a sandboxed container: Postgres does not
survive between tool-call sessions here (`service postgresql start` after
a restart fixed it instantly) — a real, live instance of exactly the
"assume the server restarts" reliability case spec §82 already told this
project to design around. Not a concern for a real deployment; worth
knowing if you're continuing this build in a similarly ephemeral sandbox.

Also worth knowing: this sandbox has no real browser (the packaged
`chromium-browser` is a snap stub with no snapd to back it, and there's
no route to a real browser download in this environment's network
allowlist) and doesn't reliably keep background dev-server processes
alive between tool calls — so `apps/web` is proven by its production
build (`npm run build -w apps/web`) and its component tests, not by an
actual rendered screenshot. If you're picking this up somewhere with a
real browser, that's the next honest gap to close.

One design correction from the previous pass: `apps/web` used to mint a
fresh tenant into `localStorage` on first load, which meant clearing
storage or opening a second browser silently forked into a disconnected
second workspace — a data-continuity bug, not really a missing-auth
problem. Rather than build a full login/session layer to patch it (which
would be over-building for a deployment ADR 0004 already scopes to one
user), the fix was narrower: `GET /workspace` on the API is now an
idempotent single-tenant bootstrap, and the frontend calls that instead
of minting its own tenant. Real auth is still not built, and shouldn't
be, until ADR 0004 actually changes.

Backups: `infrastructure/backups/` has a real encrypted `pg_dump` backup script and a guarded restore script, proven by an actual backup → restore-into-a-fresh-database → row-count comparison (see `docs/BACKUPS.md`). Security audit and triage: `docs/SECURITY.md`.

Handover: `docs/AI_Agent_Full_Session_Handover_Prompt.md` is the handover-protocol prompt supplied for this project (filed as provided, unmodified); `docs/STATE.md` is the live status a new agent should read first.

## Still open (see docs/STATE.md for the live version of this)

- `docs/adr/0002` (drop the WhatsApp Web reader) and `docs/adr/0004` (single-tenant default) are proposed defaults, not yet confirmed — see the ADRs for why they need a real yes, not a nod-along.
- The reuse audit against Clone Micro AI and Atomic Vault/Nexus CRM Android still hasn't happened — no live access to those repos from this environment.
- The evaluation harness is real but its 5 fixtures are a starting point, not a corpus, and it has no live model to actually evaluate yet — see `docs/EXTRACTION_EVALUATION.md`.
