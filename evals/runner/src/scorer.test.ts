import { describe, it, expect } from "vitest";
import { run } from "./run.js";

/**
 * These expected numbers were computed BY HAND against the fixture set,
 * the expected/ answers, and reference-extractor.ts's known, deliberate
 * mix of correct answers and mistakes — see the working in the PR/commit
 * description, not just asserted here. This test exists to prove the
 * scorer's arithmetic is right, independent of whatever a real model
 * eventually scores.
 *
 * Hand tally across 5 fixtures:
 *   f1: TP=1 FP=0 FN=0 (all correct)
 *   f2: TP=0 FP=1 FN=0 (false positive on a non-commitment)
 *   f3: TP=2 FP=1 FN=0 (one clean match, one owner/counterpart swap, one false positive)
 *   f4: TP=1 FP=0 FN=0 (found, but date guessed instead of needs_context)
 *   f5: TP=1 FP=0 FN=0 (all correct)
 *   totals: TP=5 FP=2 FN=0
 *   precision = 5/7 ≈ 0.7143 | recall = 5/5 = 1.0
 *   date:     correct on f1,f3a,f3b,f5 = 4, wrong on f4 -> 4/5 = 0.8
 *   owner:    correct on f1,f3a,f4,f5 = 4, wrong on f3b -> 4/5 = 0.8
 *   promisedTo: correct on f1,f3a,f4,f5 = 4, wrong on f3b -> 4/5 = 0.8
 */
describe("eval harness — scorer proven against hand-computed numbers", () => {
  it("matches the independently hand-tallied aggregate exactly", () => {
    const aggregate = run();

    expect(aggregate.truePositives).toBe(5);
    expect(aggregate.falsePositives).toBe(2);
    expect(aggregate.falseNegatives).toBe(0);

    expect(aggregate.precision).toBeCloseTo(5 / 7, 10);
    expect(aggregate.recall).toBe(1);

    expect(aggregate.dateAccuracy).toBeCloseTo(0.8, 10);
    expect(aggregate.ownerAccuracy).toBeCloseTo(0.8, 10);
    expect(aggregate.promisedToAccuracy).toBeCloseTo(0.8, 10);

    expect(aggregate.schemaFailureRate).toBeNull(); // honest "n/a", not a fake 0%
  });

  it("f2's false positive and f4's wrong-date-instead-of-needs-context are penalized on the right fixtures", () => {
    const aggregate = run();
    const f2 = aggregate.perFixture.find((f) => f.fixtureId === "f2-not-a-commitment")!;
    const f4 = aggregate.perFixture.find((f) => f.fixtureId === "f4-context-dependent-date")!;

    expect(f2.falsePositives).toBe(1);
    expect(f2.truePositives).toBe(0);

    expect(f4.truePositives).toBe(1); // the commitment itself was found
    expect(f4.dateCorrect).toBe(0); // but its date handling was wrong
    expect(f4.dateTotal).toBe(1);
  });

  it("f3's owner/counterpart swap is caught by owner AND promisedTo accuracy, not date accuracy", () => {
    const aggregate = run();
    const f3 = aggregate.perFixture.find((f) => f.fixtureId === "f3-multi-item-mixed-ownership")!;

    expect(f3.truePositives).toBe(2);
    expect(f3.falsePositives).toBe(1); // the design-review-call item
    expect(f3.ownerCorrect).toBe(1);
    expect(f3.ownerTotal).toBe(2);
    expect(f3.promisedToCorrect).toBe(1);
    expect(f3.promisedToTotal).toBe(2);
    expect(f3.dateCorrect).toBe(2); // both dates were actually right
    expect(f3.dateTotal).toBe(2);
  });
});
