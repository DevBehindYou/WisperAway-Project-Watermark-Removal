import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Fixture, ExpectedAnswer } from "./types.js";
import { scoreFixture, aggregateScores } from "./scorer.js";
import { referenceTestDoubleExtractor } from "./reference-extractor.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVALS_ROOT = join(__dirname, "..", "..");
const FIXTURES_DIR = join(EVALS_ROOT, "fixtures");
const EXPECTED_DIR = join(EVALS_ROOT, "expected");
const REPORTS_DIR = join(EVALS_ROOT, "reports");

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export function run(extractor = referenceTestDoubleExtractor) {
  const fixtureFiles = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".json"));
  const perFixtureScores = [];

  console.log(`=== Running eval harness over ${fixtureFiles.length} fixtures ===\n`);

  for (const file of fixtureFiles) {
    const fixture = loadJson<Fixture>(join(FIXTURES_DIR, file));
    const expected = loadJson<ExpectedAnswer>(join(EXPECTED_DIR, file));

    const candidates = extractor(fixture);
    const score = scoreFixture(expected, candidates);
    perFixtureScores.push(score);

    console.log(
      `${fixture.id}: TP=${score.truePositives} FP=${score.falsePositives} FN=${score.falseNegatives}` +
        (score.dateTotal ? ` | date ${score.dateCorrect}/${score.dateTotal}` : "") +
        (score.ownerTotal ? ` | owner ${score.ownerCorrect}/${score.ownerTotal}` : "")
    );
  }

  const aggregate = aggregateScores(perFixtureScores);

  console.log("\n=== Aggregate (spec §30 metrics) ===");
  console.log(`Precision:            ${(aggregate.precision * 100).toFixed(1)}%`);
  console.log(`Recall:               ${(aggregate.recall * 100).toFixed(1)}%`);
  console.log(`Date accuracy:        ${aggregate.dateAccuracy === null ? "n/a" : (aggregate.dateAccuracy * 100).toFixed(1) + "%"}`);
  console.log(`Owner accuracy:       ${aggregate.ownerAccuracy === null ? "n/a" : (aggregate.ownerAccuracy * 100).toFixed(1) + "%"}`);
  console.log(`Promised-to accuracy: ${aggregate.promisedToAccuracy === null ? "n/a" : (aggregate.promisedToAccuracy * 100).toFixed(1) + "%"}`);
  console.log(`Schema failure rate:  ${aggregate.schemaFailureRate === null ? "n/a — no live model call in this run" : (aggregate.schemaFailureRate * 100).toFixed(1) + "%"}`);

  mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = join(REPORTS_DIR, `report-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        extractorNote: "referenceTestDoubleExtractor — a hand-written test double, NOT a live model. See src/reference-extractor.ts.",
        aggregate,
      },
      null,
      2
    )
  );
  console.log(`\nReport written to ${reportPath}`);

  return aggregate;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
