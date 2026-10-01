/**
 * Types for the evaluation harness (spec §30). Kept deliberately small and
 * concrete rather than mirroring the full production schema — this exists
 * to measure extraction quality, not to be the production data model.
 */

export type DateExpectation =
  | { kind: "resolved"; dueAtUtc: string }
  | { kind: "needs_context" };

export interface ExpectedCommitment {
  id: string;
  title: string;
  owner: string;
  promisedTo?: string;
  clientHint?: string;
  rawDatePhrase?: string;
  dateExpectation?: DateExpectation;
}

export interface ExpectedAnswer {
  fixtureId: string;
  commitments: ExpectedCommitment[];
}

export interface Fixture {
  id: string;
  kind: string;
  occurredAt: string;
  timezone: string;
  participants: string[];
  body: string;
}

/**
 * What an extractor produces for one candidate. `matchesExpectedId` is set
 * by the extractor under test to say "this candidate is meant to represent
 * expected item X" (or left undefined for a genuine false positive). This
 * is a stand-in for the real duplicate/similarity matching spec §27 asks
 * for, which doesn't exist yet — seeevals/runner/README.md.
 */
export interface ExtractedCandidate {
  fixtureId: string;
  matchesExpectedId?: string;
  title: string;
  owner: string;
  promisedTo?: string;
  resolvedDueAtUtc?: string;
  needsContext?: boolean;
}

export type Extractor = (fixture: Fixture) => ExtractedCandidate[];

export interface FixtureScore {
  fixtureId: string;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  dateCorrect: number;
  dateTotal: number;
  ownerCorrect: number;
  ownerTotal: number;
  promisedToCorrect: number;
  promisedToTotal: number;
}

export interface AggregateScore {
  precision: number;
  recall: number;
  dateAccuracy: number | null;
  ownerAccuracy: number | null;
  promisedToAccuracy: number | null;
  schemaFailureRate: number | null;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  perFixture: FixtureScore[];
}
