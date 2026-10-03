# Project Analysis — WisperAway-Project-Watermark-Removal

Analysis date: 2026-10-03 · Scope: every file in the repo (111 tracked files, two commits) · Method: read all source and docs, ran every test suite, typecheck and build, then probed suspected bugs against a live PostgreSQL 16 instance.

---

## 0. TL;DR

1. **The repo holds two unrelated projects.** Every line of code is **Keystone**, a personal "Chief of Staff" commitment tracker (TypeScript, Fastify, Postgres, React). The `watermark-removal-blueprint/` folder is **CleanMark**, a docs-only plan for an AI watermark-removal SaaS with **no code at all**. The repo name matches neither project.
2. **Keystone's tests are green.** 23 date-resolver tests, 3 eval-scorer tests and 12 web component tests pass. The web build and all three typechecks are clean, and both smoke scripts pass against a real database.
3. **Keystone still has confirmed bugs those tests don't reach.** Seven were reproduced against a live database (§2.3). The worst is a timezone bug that puts due dates a full day early, which breaks the product's core promise ("never silently invent deadlines").
4. **CleanMark is a solid, buildable plan** with a handful of internal contradictions (§3.3). Before any code is written, it needs a decision on where it lives.

---

## 1. Inventory

| Area | Project | What it is | State |
|---|---|---|---|
| `packages/date-resolution` | Keystone | Deterministic relative-date parser (Luxon) | Real, 23 tests |
| `services/api` | Keystone | Fastify + Drizzle + Postgres API, 13-table schema, 2 smoke scripts | Real, runs |
| `apps/web` | Keystone | React 18 + Vite: Dashboard, Review Queue, Clients, Search | Real, 12 tests, builds |
| `evals/` | Keystone | 5 fixtures, expected answers, scorer and runner (test-double extractor) | Real, 3 tests |
| `infrastructure/backups` | Keystone | Encrypted `pg_dump` backup and guarded restore | Real |
| `docs/` + root `*.md` | Keystone | 4,811-line spec, state doc, 4 ADRs, security/backups/eval docs, design system, handover prompt | Docs |
| `watermark-removal-blueprint/` | CleanMark | 22 docs + 5 ADRs + `COMPLETE_PROJECT_SPECIFICATION.md` | Docs only |
| `LICENSE` | — | GPL-3.0 | — |

`COMPLETE_PROJECT_SPECIFICATION.md` (115 KB) is a verbatim concatenation of `docs/00`–`21`; I checked all 22 sections and none differ. Two copies of the same text will drift apart, so keep one canonical source.

---

## 2. Keystone

### 2.1 Architecture as built

```
apps/web (Vite :5173) --/api proxy--> services/api (Fastify :3000) --> Postgres
                                           |
                                           +-- @keystone/date-resolution (deterministic resolver)
evals/runner --> fixtures + expected --> scorer (no live model; test double)
```

The flow is SourceEvent → candidate (deterministic date resolution) → human accept/reject → Commitment → append-only `commitment_changes` ledger. WAITING items, Client View timeline and Postgres full-text search are built on top of it.

### 2.2 Verified results (run this session)

| Check | Result |
|---|---|
| `npm test -w packages/date-resolution` | 23/23 pass |
| `npm test -w evals/runner` | 3/3 pass |
| `npm test -w apps/web` | 12/12 pass |
| `npm run build -w apps/web` | Pass (161.6 kB JS, 50.6 kB gzip) |
| `tsc --noEmit` on api, date-resolution, evals | Clean |
| `npm run smoke` / `smoke:http` vs live Postgres 16 | Both pass |
| `npm audit` | 8 findings (1 critical, 1 high, 6 moderate). Matches `docs/SECURITY.md`'s deferred dev-tooling list |
| `npm run db:push` | **Fails**. Root cause found (§2.3 #8) |

### 2.3 Confirmed bugs, reproduced against live Postgres

| # | Severity | Bug | Evidence |
|---|---|---|---|
| 1 | **Critical** | **Due dates resolve against the UTC clock, not the user's local clock.** `services/api/src/services/commitments.ts:75` passes `anchor.toISOString().slice(0,19)`, a UTC wall-clock time, to a resolver that treats it as local time in `timezone`. Any event between 00:00 and 05:30 IST lands on the previous day. | "tomorrow" said Fri 02:00 IST came back as **Fri 25 Sep 17:00 IST**. Correct answer: **Sat 26 Sep**. The HTTP smoke test misses this because its 10:00 IST anchor stays on the same date in UTC. |
| 2 | **High** | **The UI's Reject button always fails.** `apps/web/src/api/client.ts:96` sends `Content-Type: application/json` on every request; `rejectCandidate` sends no body, so Fastify answers 400 `FST_ERR_CTP_EMPTY_JSON_BODY`. | Reproduced: 400. The component tests mock `fetch`, and no smoke test calls reject. |
| 3 | **High** | **Concurrent accepts create duplicate commitments.** `acceptCandidate` (`commitments.ts:149–195`) reads the state, then inserts, then updates, with no transaction or conditional update. | 10 of 10 candidates were accepted more than once under 8 parallel requests each. The 409 test only covers sequential requests. |
| 4 | **High** | **`GET /workspace` forks the workspace on first boot.** `getOrCreateSingleTenant` (`services/setup.ts:22`) is check-then-insert, and `apps/web/src/main.tsx` uses `StrictMode`, which runs the bootstrap effect twice in dev. This is the same data-continuity bug the endpoint was built to fix. | Two concurrent calls on an empty database returned **two different tenants**. `limit(1)` with no `ORDER BY` then picks one arbitrarily. |
| 5 | Medium | **Accepted candidates can be rejected.** `rejectCandidate` (`commitments.ts:197`) has no state guard, so a live commitment ends up pointing at a REJECTED candidate. | 200, state=REJECTED |
| 6 | Medium | **Hint matching guesses, contradicting its own "exact match" comment.** `resolvePersonByHint` uses `ilike '%hint%'` (`commitments.ts:145`). Neither resolver escapes `%`/`_`, so hint `"al"` links "Sally Rao" and client hint `"%"` links any client. | Both links were created. |
| 7 | Low | Malformed UUIDs in route params return 500, not 400/404 (every `/:id` route). | `GET /commitments/not-a-uuid` → 500 |
| 8 | Medium | **`drizzle-kit push` fails** with "please install required packages: 'drizzle-orm'". **Root cause:** `drizzle-kit` is hoisted to root `node_modules`, while `drizzle-orm` is nested in `services/api/node_modules` (the lockfile pins it there). drizzle-kit loads it with ESM `import()` from its own location, so it can't find it. | With drizzle-orm temporarily symlinked at root, push succeeded. Fix: get `drizzle-orm` hoisted (regenerate that lockfile entry), or move `drizzle-kit` next to it. |

### 2.4 Code-level issues (from reading the code, not run)

**Data integrity**
- None of the multi-step writes use a transaction: `acceptCandidate`, `recordDueDateChange` and `markCommitmentWaiting`. A failure halfway leaves a commitment with no ledger row. Spec §107 explicitly requires "transaction boundaries".
- `markCommitmentWaiting` accepts commitments that are already WAITING or DONE, creating duplicate `waiting_items`. Its ledger row hardcodes `initiatorSide: "US"`.
- Commitments can be accepted from `NEEDS_DATE_REVIEW` with a null due date, and the UI has no way to set the date first. This sidesteps spec §4.2's review gate.
- Every `/:id` route ignores tenant: source-events, commitments, client view, accept/reject, waiting and due-date. ADR 0004 accepts that for now, but the server binds `0.0.0.0` with no auth (`services/api/src/index.ts:18`), so anyone on the LAN can read or write everything.

**Date resolver** (`packages/date-resolution/src/resolve.ts`)
- `"by Friday"`, the most common English form (used in 3 of 5 fixtures), returns `unrecognized`. The pipeline will push it to review unless the extractor strips "by".
- `"this Monday"` said on a Wednesday silently becomes next Monday with **high** confidence. The comment at line 216 says "treat as unresolved-ish", but the code doesn't.
- Every default-time result carries two near-duplicate assumption strings.

**Web app**
- `App.tsx:27` never checks `r.ok`. If `/workspace` returns 500, the app shows "Loading…" forever.
- Client View keeps the previous client's data on screen while the next one loads, and out-of-order responses can show the wrong client. The test that claims "not stale data" only checks the final state.
- On Search, the empty-state message echoes the live input, not the query that was actually submitted.
- The `index.html` title still reads "Keystone — Review Queue".
- Layouts use fixed `1fr 1fr` and `220px 1fr` grids with no mobile breakpoint.
- **There is no capture UI.** Candidates can only be created through the API, so the Phase 1 outcome ("works as a commitment database") isn't reachable from the app.

**Eval harness**
- `scorer.ts:276` counts two candidates claiming the same `matchesExpectedId` as **two** true positives. That inflates precision; the second should be a false positive or a duplicate.
- Precision defaults to 100% when there are zero candidates (`?? 1`).
- Each test calls `run()`, so every test run writes 3 report files.
- `types.ts:40` points to "seeevals/runner/README.md", a typo for a file that doesn't exist.
- The runner declares `@keystone/date-resolution` as a dependency but never imports it.

**Backups** (`infrastructure/backups/backup.sh`)
- Lines 46–52 write the **plaintext** dump to disk first. If `openssl` fails, `set -e` exits before line 52's `rm`, leaving an unencrypted dump. Add `trap` cleanup or pipe `pg_dump | openssl` directly. The file is also created with the default umask.
- `restore.sh` echoes `RESTORE_TARGET_URL`, password included.
- AES-256-CBC without a MAC means tampering isn't detected.

**Smoke tests**
- `smoke.ts` re-implements accept with direct inserts instead of calling the service, which contradicts "one place for what happens on accept".
- `http-smoke.ts` creates a new tenant on every run in the same database `/workspace` reads from, so after one smoke run the "single" workspace can resolve to the smoke tenant.
- Neither script asserts a resolved due-date value, which is why bug #1 survived.

### 2.5 Spec compliance gaps (Phase 0/1)

| Spec requirement | Status |
|---|---|
| Phase 0 exit: real precision/recall for ≥2 models | Not met. Test double only (documented honestly) |
| Phase 0 docs: `REUSE_AUDIT`, `ARCHITECTURE` (with diagram), `DATA_MODEL` (with ERD), `INTEGRATIONS`, `COST_MODEL`, `RISK_REGISTER`, `ROADMAP` | **None exist** |
| §107: migrations, linting, formatting, transactions | No migrations folder (push only), no ESLint/Prettier, no transactions |
| Phase 1: evidence, tasks, identity | Tables exist, but nothing writes `source_evidence`, `tasks` or `person_identities` |
| §27 dedup/merge, §29 per-source thresholds | Not built (0.85 is hardcoded in two UI files) |
| §74 cross-tenant tests | None (deferred by ADR 0004) |
| §106 "no buttons that do nothing" | Violated by Reject (bug #2) |
| Kickoff brief: "anonymized fixture set" | **Not anonymized.** Fixtures, tests and smoke scripts use real client company names and real contact names (Priya Nair / WebOsmotic, Rahul Mehta / Ariel Software Solutions), the same names that appear as public testimonials. Worth scrubbing if this repo is or becomes public. |
| No CI | No `.github/workflows` |

### 2.6 Documentation drift

- `docs/STATE.md` lists Search under "Not started", yet Search is built. It says "No GitHub remote connected yet", yet the repo is on GitHub. Its "Last updated" date is 2026-09-20, but it describes a 2026-09-29 backup run. Its Review Queue entry still says "4 component tests" and "two screens".
- ADR 0002 is still "Proposed", but `smoke.ts:135` calls WhatsApp Mode A "the one that shipped, per ADR 0002".
- ADR 0004's decision text says "no tenant table plumbed through every entity", while the schema takes the "reserved but unenforced `tenant_id`" middle option. The ADR should say which option was taken.
- The handover protocol asks for `INDEX.md`, `HANDOVER.md`, `PROJECT_CONTEXT.md` and `SESSION_HISTORY.md`; none exist. `STATE.md` currently stands in for them.
- `apps/web/tsconfig.tsbuildinfo` is a build artifact that's committed; add it to `.gitignore`.

---

## 3. CleanMark (watermark-removal blueprint)

### 3.1 What it specifies

The core flow is Upload → mask (manual / SAM 2 click / OCR + Grounding DINO auto) → inpaint (OpenCV, then LaMa, then diffusion fallback) → compare → export → delete. The stack is Next.js 16 BFF, Supabase Postgres/Auth, private R2, QStash/Workflow, and a separate Python/FastAPI GPU worker on Modal. The plan runs from Phase 0 (repo foundation) to Phase 9 (custom watermark model), with the first useful product at Phase 3.

### 3.2 Strengths

- **The scope is right.** It starts with manual masks and adds automation later; it says plainly that "removal = reconstruction"; and it composites only the masked region back.
- **The legal posture is defensible.** It requires an authorization attestation, preserves C2PA, never builds a strip-provenance feature, and covers India Copyright Act §65B. Positioning it as a cleanup editor, not a "remove anyone's mark" tool, helps both trust and payment-provider approval.
- **The engineering basics are solid.** Queues carry IDs only, retries are idempotent, attempts are immutable, model versions are pinned with checksums, a license registry is required, and release gates are concrete.

### 3.3 Internal contradictions to fix before building

| Where | Issue |
|---|---|
| `03` state machine, line 147 | "Any **non-terminal** state → DELETED", but FR-010 and Scenario C delete **completed** jobs, which are terminal. Delete must be allowed from COMPLETED, FAILED and EXPIRED. |
| `03` vs `09`:127 | `09` uses a `DELETING` state that `03`'s state machine doesn't define. |
| `03` vs FR-007 | Two different stage vocabularies: `UPLOAD_PENDING`/`MASK_READY`… versus "upload / mask-ready / post-processing". Pick one and map the other to UI labels. |
| `07` vs `09`:99 | `lease_expires_at` is required by the attempt-lease design but is missing from the `processing_attempts` table. |
| `07` | The `job_status` and `attempt_status` enums are referenced but never defined. `QUALITY_REVIEW_FAILED` (`06`:168) isn't in any enum. |
| FR-001 vs `08` | FR-001 validates dimensions *before* issuing the signed URL, but the presign request carries no dimensions. Either accept client-reported dimensions as advisory or validate only after upload. |
| `13` | It calls for pnpm + Turborepo, while this repo is an npm-workspaces monorepo. That only matters if both projects share a repo, which they shouldn't (§4). |
| Free-tier math (`18`) | QStash Free's 1,000 messages/day is consumed by retries and Workflow steps, giving roughly 200–300 completed jobs/day before paying, not 1,000. The doc warns about this but doesn't size it. |
| Versions/prices | Dated 2026-09-08. The docs themselves require re-verifying them before implementation lock. |

---

## 4. Repo-level findings

1. **Identity.** The repo name ("WisperAway…Watermark-Removal"), the code (Keystone) and the blueprint (CleanMark) are three different names. An agent following `PHASE0_KICKOFF_BRIEF_PLAIN.md` would never find the watermark docs, and an agent starting from the blueprint would find Keystone code where it expects `apps/web`. **Recommendation:** give each product its own repo (or rename and document one canonical project) before writing any CleanMark code.
2. **License.** GPL-3.0 conflicts with the "build-to-sell" option in ADR 0004 and with selling CleanMark. GPL doesn't cover SaaS network use, but distributed binaries such as the planned Android and desktop companions would have to be open-sourced. Decide on the license deliberately.
3. **History.** Two commits ("Initial commit", "Push"). `STATE.md` notes that earlier history was lost. Commit in small, described units from here on.

---

## 5. Recommended next actions (ROI-ordered)

1. **Fix bug #1 (timezone anchor).** Convert with `DateTime.fromJSDate(anchor).setZone(timezone).toISO({ includeOffset: false })`, and add a smoke assertion with a 02:00 IST anchor.
2. **Fix bugs #2–#5.** Only send `Content-Type` when there is a body. Make accept a single transaction with `UPDATE … WHERE state NOT IN ('ACCEPTED','REJECTED') RETURNING`. Use `INSERT … ON CONFLICT` (or an advisory lock) for `/workspace`. Guard reject on state.
3. **Fix hint matching (#6).** Use exact case-insensitive equality and escape LIKE wildcards; if there are zero or more than one matches, return null and mark `NEEDS_IDENTITY_REVIEW`.
4. **Unblock schema changes (#8).** Re-hoist `drizzle-orm`, then switch from `push` to generated migrations (`drizzle-kit generate` into `src/db/migrations`) per spec §107.
5. **Add CI** running the three test suites, three typechecks and the web build, plus a Postgres service job for both smoke scripts.
6. **Anonymize fixtures and tests**, then grow the corpus past 5, including "by <day>" phrasing.
7. **Build a manual capture form** in `apps/web`, so the app works as a commitment database without API calls.
8. **Separate CleanMark** into its own repo, resolve the §3.3 contradictions in its docs, then start its Phase 0.
