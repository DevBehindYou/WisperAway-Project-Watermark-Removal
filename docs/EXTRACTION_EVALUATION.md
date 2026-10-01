# Extraction Evaluation

Spec §30: build this before trusting extraction. Spec §98/§99: Phase 0 does not close until real precision/recall/date-accuracy numbers exist. This document is those numbers, and what they do and don't mean yet.

## What exists right now

- **5 fixtures** (`evals/fixtures/`), each with a hand-written **expected answer** (`evals/expected/`). Deliberately small and deliberately varied, not a random sample: one clean single commitment, one pure non-commitment (spec §26's own "we should probably improve that someday" example), one multi-item text with mixed ownership direction and a decoy item that shouldn't be extracted at all, one commitment with a genuinely context-dependent date, and one commitment owed *to* Ashu rather than *by* him.
- A **scorer** (`evals/runner/src/scorer.ts`) implementing precision, recall, date accuracy, owner accuracy, and promised-to accuracy exactly as spec §30 defines them.
- A **runner** (`evals/runner/src/run.ts`) that loads every fixture, runs an extractor over it, scores the result, prints a summary, and writes a timestamped JSON report to `evals/reports/`.

## The current run is NOT a measure of real extraction quality

There is no LLM available in this build environment (see `docs/STATE.md`), so there is no live model to evaluate yet. The runner currently executes against `reference-extractor.ts` — a **hand-written test double**, explicitly labeled as such in its own file header — that exists purely to prove the scorer's arithmetic is correct before any real model gets wired in.

Its answers are deliberately a mix of right and wrong, on purpose, so the current numbers exercise every metric instead of showing a hollow 100% or 0%:

| Metric | Current (test double) result |
|---|---|
| Precision | 71.4% (5 true positives, 2 false positives) |
| Recall | 100% (nothing was missed) |
| Date accuracy | 80% (one commitment was found but got a guessed date instead of correctly flagging `needs_context`) |
| Owner accuracy | 80% (one commitment's owner and counterpart were swapped) |
| Promised-to accuracy | 80% (same swap) |
| Schema failure rate | n/a — meaningless without a real model call |

Every one of those numbers is checked against an independently hand-tallied expected value in `evals/runner/src/scorer.test.ts`, which passes. That test is the actual proof here — it's proof the *scorer* is trustworthy, not proof any extraction is.

**Do not report these numbers as system performance. Delete `reference-extractor.ts` the moment a real `ModelAdapter` (spec §31) exists, and re-point the runner at it.**

## Known gaps in the harness itself

- **Matching is by explicit ID, not real similarity.** A production extractor won't tag its own output with `matchesExpectedId` — spec §27's deduplication/similarity logic needs to exist before this harness can score a real model's raw output. Right now the runner sidesteps that problem entirely; it doesn't solve it.
- **5 fixtures is a starting point, not a corpus.** No near-duplicate fixtures yet (so duplicate rate is untested), no noisy/ambient-audio-style transcript fixtures, no multi-source evidence-accumulation case (spec §14's example of the same commitment appearing in a Meet call, then an email, then a WhatsApp message).
- **Schema failure rate genuinely can't be measured yet** — it's specifically about a model provider returning unusable output, which requires a real provider call.
- **Whoever writes new fixtures should not also be the one tuning or scoring a real model against them, without care.** These 5 were authored and hand-scored in the same sitting, by the same author (in this case, an AI assistant) who therefore already "knows the answer" going in. That's fine for proving the *scorer* works — there's no extraction happening, just arithmetic on known inputs. It stops being fine the moment a real model gets evaluated: if the same party who wrote the expected answers also builds or tunes the extractor, there's a real risk of unconsciously writing fixtures the extractor is likely to get right, or tuning prompts against the exact wording of these 5 texts rather than the general capability. A held-out fixture set, written without sight of (or by someone other than) whoever builds the ModelAdapter, is worth doing before trusting any real precision/recall number this harness eventually produces.

## Running it

```bash
npm test -w evals/runner   # scorer correctness tests
npm run run -w evals/runner # runs the harness, prints results, writes a report
```
