# Phase 0 Kickoff Brief — Personal Chief of Staff / Commitment Intelligence System

*(Companion to the full 112-section spec. Read this before starting any implementation work. Plain-language version of `PHASE0_KICKOFF_BRIEF.md`.)*

## For whoever — or whatever — picks this up next

If you're an AI coding agent starting a new session, you have no memory of prior sessions. That's expected. Before writing any code:

1. Read `docs/PRODUCT_SPEC.md` — the full spec. Defines *what* to build.
2. Read `docs/STATE.md` — a living status doc. Defines *where things currently stand* (done / in progress / broken / next).
3. Read this file — defines *how* to start.

If `docs/STATE.md` doesn't exist yet, create it: a simple status table, updated every session, not just at the end of a phase. This matters in practice — on Nexus CRM Android, work that crossed between sessions and between agents (Claude, then Google AI Studio's Gemini) produced real drift: mismatched field names against the live backend, an un-gitignored debug keystore, a debug UI tab that nearly shipped to release. A lightweight, continuously updated state doc would have caught all of it.

## What Phase 0 is for

Phase 0 doesn't build the product. It proves the product *can* be built, and specifically proves the AI extraction is accurate enough to trust with real deadlines.

Per the spec: **do not move into Phase 1 until extraction-accuracy numbers exist.** Not confidence — measured numbers.

## Ground rules carried over from the full spec

- Never let the system silently resolve a relative date. Two independent resolvers (AI + deterministic) must agree; disagreement routes to human review.
- Never send anything client-facing without explicit human approval — draft-first, always.
- Never hide uncertainty — if the system isn't confident, it says so.
- Small, ambiguous decisions: make the safest reasonable call, write a one-page ADR explaining why, keep moving.
- Large, ambiguous decisions (see Open Decisions below): stop and get a human call.

## First priority: a reuse audit, before any new research

Before researching anything external, check what already exists:

- **Clone Micro AI** — already has a GPT → Perplexity → Gemini → Claude → Ollama failover cascade. Confirm whether this is working code or just design documentation. If it's real, don't rebuild it — generalize it into the ModelAdapter layer the spec calls for (Section 31).
- **Atomic Vault** and **Nexus CRM Android** — both already use Kotlin, Jetpack Compose, Material 3, Android Keystore, and biometric unlock — exactly what the spec's Android companion needs (Section 73). Reuse the pattern rather than rebuilding it.

Document findings in `docs/REUSE_AUDIT.md` — one line per component, reusable or not, and why.

## Open decisions that need a human call before more building happens

1. **Google OAuth token lifecycle.** For a personal Gmail account with an unverified ("Testing") OAuth app, refresh tokens for Gmail/Calendar/Meet scopes expire seven days after consent, and personal accounts have no "Internal" audience option to avoid this (that's Workspace-org only). Decide: build a recurring re-consent flow, or go through Google's app verification (real time cost; requires a privacy policy and likely a security review for sensitive scopes). Needed before Phase 2 touches Gmail/Calendar.
2. **The experimental WhatsApp Web reader (Mode D).** WhatsApp's own terms prohibit scraping and unofficial-client automation outright, regardless of whether anything is ever sent. This is a real account-loss risk, not a hypothetical one. Recommendation: drop Mode D, or restrict any experiment to a number you can afford to lose — never the primary line. Decide now, not once it's half-built.
3. **Consent for recording other participants.** Meeting-mode capture records clients and teammates, not just you. Consent requirements vary by jurisdiction, and the work is async across time zones with clients in different places. This needs an explicit policy — likely a standard verbal disclosure — before Phase 3 (Meet) or Phase 4 (desktop voice) begins.
4. **Personal tool vs. future product.** The spec calls for multi-tenancy and row-level security from day one, "even with one org." That's real infrastructure cost for a feature nobody uses yet — unless this is meant to eventually become sellable, the way other projects (APEX, the Financial Intelligence Engine) have been positioned. Decide explicitly: personal-only for now (defer the tenant work) or build-to-sell (keep it in from the start). Either is fine — just make the call and write it down.

## Deliverables for this phase, in order (each feeds the next)

- [ ] `docs/PRODUCT_SPEC.md` — the full spec, committed into the repo, not just living in chat history
- [ ] `docs/STATE.md` — the living status doc described above
- [ ] `docs/REUSE_AUDIT.md` — findings on Clone Micro AI and Atomic Vault/Nexus CRM Android reuse
- [ ] Four ADRs, one per open decision above — e.g. `docs/adr/0001-oauth.md`
- [ ] `docs/ARCHITECTURE.md` with an actual diagram
- [ ] `docs/DATA_MODEL.md` with an ERD — start from the spec's Section 11 entity list, trimmed per decision #4
- [ ] `docs/INTEGRATIONS.md` — a real table covering Gmail, Calendar, Meet, each WhatsApp mode, and microphone capture (Windows/Android/Chrome), with columns for auth, permissions, rate limits, cost, policy risk, and fallback behavior
- [ ] `docs/SECURITY.md` — threat model, starting from Section 73 of the spec
- [ ] `/evals/` — actual code: an anonymized fixture set, an expected-answer set, a runner script, and report output
- [ ] A deterministic date resolver with a full test suite (tomorrow, next Friday, EOD, "after the client call," timezone edges, DST edges — per Section 95)
- [ ] A minimal, working SourceEvent → Candidate pipeline
- [ ] That pipeline run against fixtures with at least one local model (e.g. Ollama) and one remote model (whichever you already have access to)
- [ ] `docs/COST_MODEL.md`, `docs/RISK_REGISTER.md`, `docs/ROADMAP.md`, and an executive summary — written **last**, once real numbers exist, not speculatively upfront

## Exit criteria — all must be true before moving to Phase 1

- The evaluation harness has run against a real, anonymized fixture set
- Precision, recall, date-accuracy, and schema-failure-rate numbers exist for at least two models (one local, one remote) — recorded, not just recalled
- All four open decisions have an ADR — decided, or explicitly deferred with a stated reason
- Architecture diagram, ERD, threat model, and integration table are committed and readable by a new session with no chat history required
- The reuse audit is complete, with a clear yes/no on each reuse candidate
- `docs/STATE.md` exists and has already been updated at least once, confirming the convention actually works

If every item above is true, move to Phase 1. If even one isn't, hold — regardless of how ready the rest feels.
