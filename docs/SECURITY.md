# Security

Spec §109: dependency CVE checks after each phase. This is the first real pass — `npm audit` across the whole monorepo, then triage, not blind `npm audit fix --force`.

## Audit result (before any changes)

9 findings: 1 critical, 2 high, 6 moderate.

| Package | Severity | Runtime or dev-only | Action |
|---|---|---|---|
| `drizzle-orm` (GHSA-gpj5-g38j-94v9 / CVE-2026-39356) | High (CVSS 7.5) | **Runtime** | **Fixed** — upgraded 0.36 → 0.45.3 |
| `drizzle-kit` (transitive esbuild issue) | Moderate | Dev-only CLI | **Upgraded** to 0.31.11 alongside the above |
| `vitest` / `@vitest/mocker` | Critical (path traversal) | Dev-only (test runner) | **Deferred** — see below |
| `vite` / `vite-node` / `esbuild` | Moderate (dev-server request forwarding) | Dev-only | **Deferred** — see below |

## The drizzle-orm finding, specifically

The advisory is about improper escaping in `sql.identifier()` and `.as()` — APIs that build SQL *identifiers* from input. It is not about ordinary parameterized values. This codebase uses neither API anywhere (`grep` for `sql.identifier` and `.as(` returns nothing). The only raw `sql` template use is in `services/api/src/services/search.ts`, where user input is interpolated as a bound parameter and column references come from the schema, not from input. So this was **not exploitable here as written**. Upgraded anyway: it's a high-severity advisory in a core runtime dependency, and the fix line (0.45.x) is reported as fixes-only.

After the upgrade, the real runtime path was re-verified, not assumed: the DB smoke test, the HTTP smoke test (every route, joins, the search endpoint), the date-resolution tests, the eval-harness tests and the web tests all pass on drizzle-orm 0.45.3.

## Deliberately deferred, and why

- **vitest 2 → 5 and vite 5 → 8** are the audit's suggested fixes, and both are multi-major jumps in test/build tooling. The exposure is dev-only: a local dev server or test runner running on a developer's machine, not anything that ships. Forcing two major-version tooling upgrades at once risks breaking all three test suites and the web build for a low-exposure finding. Proper fix: upgrade them deliberately, one at a time, with a changelog read and the full suite as the gate. Not done yet.

## New issue found during this pass

- **`drizzle-kit push` fails after the upgrade** with `Error please install required packages: 'drizzle-orm'`, even though `drizzle-orm@0.45.3` resolves fine from both ESM and CJS in `services/api`. Others have reported the same message in other layouts; no single root cause found here. It affects only the schema-push CLI, not the running application or the already-deployed schema (unchanged, and proven by every smoke test). It will block the *next* schema change until solved. Not yet root-caused.

## Not covered

No auth, rate limiting, CSRF or log-redaction review yet (spec §109's other items) — there is no auth layer to review (see ADR 0004), and the rest hasn't been examined.
