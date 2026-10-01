import type { Extractor } from "./types.js";

/**
 * TEST DOUBLE — NOT A REAL EXTRACTOR.
 *
 * This environment has no LLM credentials (see docs/STATE.md), so there is
 * no live model to score yet. This function exists ONLY to give the runner
 * and scorer something real to execute against, so the scoring math itself
 * is proven correct before a real ModelAdapter (spec §31) gets wired in.
 *
 * Its outputs are hand-written per fixture, and DELIBERATELY include a mix
 * of correct answers and specific, realistic mistakes (a false positive on
 * a vague non-commitment, an owner/counterpart swap, a guessed date where
 * the correct behavior was to say "needs context") — so the resulting
 * report is a genuine, non-trivial exercise of every metric in spec §30,
 * not a hollow 100% or 0%.
 *
 * DELETE THIS FILE once a real ModelAdapter-backed extractor exists. Do
 * not mistake its scores for a measure of real extraction quality.
 */
export const referenceTestDoubleExtractor: Extractor = (fixture) => {
  switch (fixture.id) {
    case "f1-clear-dated-commitment":
      return [
        {
          fixtureId: fixture.id,
          matchesExpectedId: "f1-c1",
          title: "Send revised homepage mockups",
          owner: "Ashu",
          promisedTo: "Priya",
          resolvedDueAtUtc: "2026-09-25T11:30:00.000Z",
        },
      ];

    case "f2-not-a-commitment":
      // Deliberate false positive: a real extractor should NOT produce
      // anything here. This one wrongly does, so the scorer can prove it
      // penalizes precision correctly.
      return [
        {
          fixtureId: fixture.id,
          // no matchesExpectedId — this is the false positive
          title: "Improve onboarding flow",
          owner: "Ashu",
        },
      ];

    case "f3-multi-item-mixed-ownership":
      return [
        {
          fixtureId: fixture.id,
          matchesExpectedId: "f3-c-a",
          title: "Deliver the API integration guide",
          owner: "Ashu",
          promisedTo: "Jidoka Technologies",
          resolvedDueAtUtc: "2026-09-25T11:30:00.000Z",
        },
        {
          fixtureId: fixture.id,
          matchesExpectedId: "f3-c-b",
          title: "Send the staging server credentials",
          // Deliberate owner/counterpart swap — correct date, wrong attribution.
          owner: "Ashu",
          promisedTo: "Devendra",
          resolvedDueAtUtc: "2026-09-28T11:30:00.000Z",
        },
        {
          fixtureId: fixture.id,
          // Deliberate false positive: item 3 has no single clear owner and
          // shouldn't have been extracted at all.
          title: "Schedule design review call",
          owner: "Ashu",
        },
      ];

    case "f4-context-dependent-date":
      return [
        {
          fixtureId: fixture.id,
          matchesExpectedId: "f4-c1",
          title: "Circle back with Rahul about the invoice",
          owner: "Ashu",
          promisedTo: "Rahul",
          // Deliberate mistake: guesses a date instead of flagging
          // needs_context, exactly the failure mode spec §4.2 exists to
          // catch.
          resolvedDueAtUtc: "2026-10-02T11:30:00.000Z",
          needsContext: false,
        },
      ];

    case "f5-client-owed-commitment":
      return [
        {
          fixtureId: fixture.id,
          matchesExpectedId: "f5-c1",
          title: "Send the final logo files",
          owner: "Meera",
          promisedTo: "Ashu",
          resolvedDueAtUtc: "2026-09-28T11:30:00.000Z",
        },
      ];

    default:
      return [];
  }
};
