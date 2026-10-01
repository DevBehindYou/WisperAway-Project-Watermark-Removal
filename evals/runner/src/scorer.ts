import type {
  ExpectedAnswer,
  ExtractedCandidate,
  FixtureScore,
  AggregateScore,
} from "./types.js";

/**
 * Scores one fixture's extracted candidates against its expected answer.
 *
 * Matching is done by `matchesExpectedId`, not by fuzzy text similarity —
 * see types.ts's note on ExtractedCandidate. A real production dedup/match
 * step (spec §27) is a separate, not-yet-built piece; this harness measures
 * extraction quality given a known correspondence, not the matching itself.
 */
export function scoreFixture(
  expected: ExpectedAnswer,
  candidates: ExtractedCandidate[]
): FixtureScore {
  const matchedExpectedIds = new Set<string>();
  let truePositives = 0;
  let falsePositives = 0;
  let dateCorrect = 0;
  let dateTotal = 0;
  let ownerCorrect = 0;
  let ownerTotal = 0;
  let promisedToCorrect = 0;
  let promisedToTotal = 0;

  for (const candidate of candidates) {
    const match = candidate.matchesExpectedId
      ? expected.commitments.find((c) => c.id === candidate.matchesExpectedId)
      : undefined;

    if (!match) {
      falsePositives++;
      continue;
    }

    truePositives++;
    matchedExpectedIds.add(match.id);

    // Owner accuracy — only meaningful for true positives (spec §30: "of
    // correctly found commitments, was responsibility assigned correctly?").
    ownerTotal++;
    if (candidate.owner.trim().toLowerCase() === match.owner.trim().toLowerCase()) {
      ownerCorrect++;
    }

    if (match.promisedTo) {
      promisedToTotal++;
      if (
        candidate.promisedTo &&
        candidate.promisedTo.trim().toLowerCase() === match.promisedTo.trim().toLowerCase()
      ) {
        promisedToCorrect++;
      }
    }

    if (match.dateExpectation) {
      dateTotal++;
      if (match.dateExpectation.kind === "needs_context") {
        // Correct behavior is to NOT resolve a date — flag needs_context instead.
        if (candidate.needsContext === true && !candidate.resolvedDueAtUtc) {
          dateCorrect++;
        }
      } else {
        if (candidate.resolvedDueAtUtc === match.dateExpectation.dueAtUtc) {
          dateCorrect++;
        }
      }
    }
  }

  const falseNegatives = expected.commitments.filter((c) => !matchedExpectedIds.has(c.id)).length;

  return {
    fixtureId: expected.fixtureId,
    truePositives,
    falsePositives,
    falseNegatives,
    dateCorrect,
    dateTotal,
    ownerCorrect,
    ownerTotal,
    promisedToCorrect,
    promisedToTotal,
  };
}

export function aggregateScores(perFixture: FixtureScore[]): AggregateScore {
  const sum = (f: (s: FixtureScore) => number) => perFixture.reduce((acc, s) => acc + f(s), 0);

  const truePositives = sum((s) => s.truePositives);
  const falsePositives = sum((s) => s.falsePositives);
  const falseNegatives = sum((s) => s.falseNegatives);
  const dateCorrect = sum((s) => s.dateCorrect);
  const dateTotal = sum((s) => s.dateTotal);
  const ownerCorrect = sum((s) => s.ownerCorrect);
  const ownerTotal = sum((s) => s.ownerTotal);
  const promisedToCorrect = sum((s) => s.promisedToCorrect);
  const promisedToTotal = sum((s) => s.promisedToTotal);

  const safeDiv = (n: number, d: number): number | null => (d === 0 ? null : n / d);

  return {
    precision: safeDiv(truePositives, truePositives + falsePositives) ?? 1,
    recall: safeDiv(truePositives, truePositives + falseNegatives) ?? 1,
    dateAccuracy: safeDiv(dateCorrect, dateTotal),
    ownerAccuracy: safeDiv(ownerCorrect, ownerTotal),
    promisedToAccuracy: safeDiv(promisedToCorrect, promisedToTotal),
    schemaFailureRate: null, // spec §30 — only meaningful with a real model call; see README
    truePositives,
    falsePositives,
    falseNegatives,
    perFixture,
  };
}
