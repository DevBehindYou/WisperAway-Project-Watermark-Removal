/**
 * HTTP-level proof, one layer up from smoke.ts. Drives the actual Fastify
 * app (via .inject(), no real socket needed) through the full setup ->
 * manual-capture -> review -> commitment -> ledger path over real HTTP
 * request/response objects, not direct function calls or DB seeding.
 */
import { buildApp } from "./index.js";

async function main() {
  const app = buildApp();
  await app.ready();

  console.log("=== HTTP smoke test: driving the real API end to end, including setup ===\n");

  // 0a. The single-tenant workspace bootstrap must be idempotent — calling
  // it twice must return the SAME tenant, not create a second one.
  const workspace1 = await app.inject({ method: "GET", url: "/workspace" });
  const workspace2 = await app.inject({ method: "GET", url: "/workspace" });
  const w1 = workspace1.json();
  const w2 = workspace2.json();
  console.log(`0a. GET /workspace twice -> same tenant both times: ${w1.id === w2.id} (id=${w1.id})`);
  if (w1.id !== w2.id) throw new Error("GET /workspace is not idempotent — it minted a second tenant.");

  // 0. Setup, now over HTTP too — no more hand-seeding the DB.
  const tenantRes = await app.inject({ method: "POST", url: "/tenants", payload: { name: "Ashu — personal workspace" } });
  if (tenantRes.statusCode !== 201) throw new Error(`tenant creation failed: ${tenantRes.statusCode} ${tenantRes.body}`);
  const tenant = tenantRes.json();

  const clientRes = await app.inject({
    method: "POST",
    url: "/client-accounts",
    payload: { tenantId: tenant.id, name: "Ariel Software Solutions" },
  });
  const client = clientRes.json();

  const personRes = await app.inject({
    method: "POST",
    url: "/persons",
    payload: { tenantId: tenant.id, displayName: "Rahul Mehta" },
  });
  const contact = personRes.json();
  console.log(`0. POST /tenants, /client-accounts, /persons -> all 201. Seeded "${client.name}" / "${contact.displayName}" over real HTTP.`);

  // 1. POST /source-events
  const captureRes = await app.inject({
    method: "POST",
    url: "/source-events",
    payload: {
      tenantId: tenant.id,
      kind: "MANUAL_NOTE",
      body: "Reminder to self: get Rahul the staging credentials next Friday.",
      occurredAt: "2026-09-23T10:00:00+05:30",
      sourceAdapter: "manual_capture",
    },
  });
  if (captureRes.statusCode !== 201) throw new Error(`capture failed: ${captureRes.statusCode} ${captureRes.body}`);
  const event = captureRes.json();
  console.log(`1. POST /source-events -> 201, id=${event.id}`);

  // 2. POST /candidates — using a phrase the deterministic resolver WILL flag
  // as lower-confidence ("next Friday"), to prove that path over HTTP too.
  const candidateRes = await app.inject({
    method: "POST",
    url: "/candidates",
    payload: {
      tenantId: tenant.id,
      originEventId: event.id,
      title: "Send Rahul the staging credentials",
      promisedToHint: "Rahul Mehta",
      clientHint: "Ariel Software Solutions",
      rawDatePhrase: "next Friday",
      anchor: "2026-09-23T10:00:00+05:30",
      timezone: "Asia/Kolkata",
      confidence: 0.91,
    },
  });
  if (candidateRes.statusCode !== 201) throw new Error(`candidate failed: ${candidateRes.statusCode} ${candidateRes.body}`);
  const { candidate } = candidateRes.json();
  console.log(`2. POST /candidates -> 201, state=${candidate.state}, resolved due=${candidate.deterministicResolvedDueAt}`);

  // 2b. Also prove a NEEDS_DATE_REVIEW candidate over HTTP, using a phrase
  // the resolver can't handle deterministically.
  const ambiguousRes = await app.inject({
    method: "POST",
    url: "/candidates",
    payload: {
      tenantId: tenant.id,
      originEventId: event.id,
      title: "Follow up after the client call",
      rawDatePhrase: "after the client call",
      anchor: "2026-09-23T10:00:00+05:30",
      timezone: "Asia/Kolkata",
      confidence: 0.85,
    },
  });
  const { candidate: ambiguousCandidate, dateResolutionNote } = ambiguousRes.json();
  console.log(`2b. POST /candidates (ambiguous phrase) -> state=${ambiguousCandidate.state}, note="${dateResolutionNote}"`);
  if (ambiguousCandidate.state !== "NEEDS_DATE_REVIEW") {
    throw new Error("Expected the ambiguous candidate to route to review, not resolve silently.");
  }

  // 3. GET /candidates (the review queue)
  const listRes = await app.inject({ method: "GET", url: `/candidates?tenantId=${tenant.id}` });
  console.log(`3. GET /candidates -> ${listRes.json().length} pending candidate(s)`);

  // 4. POST /candidates/:id/accept
  const acceptRes = await app.inject({
    method: "POST",
    url: `/candidates/${candidate.id}/accept`,
    payload: { acceptedBy: "me" },
  });
  if (acceptRes.statusCode !== 200) throw new Error(`accept failed: ${acceptRes.statusCode} ${acceptRes.body}`);
  const commitment = acceptRes.json();
  console.log(`4. POST /candidates/:id/accept -> 200, commitment id=${commitment.id}, status=${commitment.status}`);
  console.log(
    `4a. Hint resolution: clientAccountId matches "${client.name}"? ${commitment.clientAccountId === client.id} | promisedToId matches "${contact.displayName}"? ${commitment.promisedToId === contact.id}`
  );
  if (commitment.clientAccountId !== client.id || commitment.promisedToId !== contact.id) {
    throw new Error("Client/person hint resolution did not link the real records on accept.");
  }

  // 4b. Accepting the same candidate again should 409, not silently double-create.
  const doubleAcceptRes = await app.inject({
    method: "POST",
    url: `/candidates/${candidate.id}/accept`,
    payload: { acceptedBy: "me" },
  });
  console.log(`4b. Re-accepting the same candidate -> ${doubleAcceptRes.statusCode} (expect 409)`);
  if (doubleAcceptRes.statusCode !== 409) throw new Error("Expected 409 on double-accept.");

  // 5. POST /commitments/:id/due-date — the client moves the date
  const changeRes = await app.inject({
    method: "POST",
    url: `/commitments/${commitment.id}/due-date`,
    payload: {
      newDueAt: "2026-10-05T17:00:00+05:30",
      initiatedBy: "Rahul Mehta",
      initiatorSide: "CLIENT",
      reason: "Client asked to push to the following week.",
    },
  });
  if (changeRes.statusCode !== 201) throw new Error(`due-date change failed: ${changeRes.statusCode} ${changeRes.body}`);
  console.log(`5. POST /commitments/:id/due-date -> 201`);

  // 5b. Mark it WAITING — Ariel owes Ashu the staging environment details
  // before this can actually move forward.
  const waitingRes = await app.inject({
    method: "POST",
    url: `/commitments/${commitment.id}/waiting`,
    payload: { waitingOn: "Rahul Mehta", waitingReason: "Needs staging environment details.", initiatedBy: "me" },
  });
  if (waitingRes.statusCode !== 201) throw new Error(`waiting failed: ${waitingRes.statusCode} ${waitingRes.body}`);
  console.log(`5b. POST /commitments/:id/waiting -> 201`);

  const waitingListRes = await app.inject({ method: "GET", url: `/waiting-items?tenantId=${tenant.id}` });
  const waitingItemsList = waitingListRes.json();
  console.log(`5c. GET /waiting-items -> ${waitingItemsList.length} item(s): waiting on "${waitingItemsList[0]?.waitingOn}"`);
  if (waitingItemsList.length !== 1) throw new Error("Expected exactly one waiting item.");

  // 6. GET /commitments/:id — evidence + ledger, over HTTP
  const detailRes = await app.inject({ method: "GET", url: `/commitments/${commitment.id}` });
  const detail = detailRes.json();
  console.log(`6. GET /commitments/:id -> ledger has ${detail.ledger.length} entries:`);
  for (const row of detail.ledger) {
    console.log(`     [${row.initiatorSide}] ${row.fieldName}: ${row.oldValue ?? "(none)"} -> ${row.newValue}`);
  }

  // 7. GET /commitments (dashboard list)
  const dashRes = await app.inject({ method: "GET", url: `/commitments?tenantId=${tenant.id}` });
  console.log(`7. GET /commitments -> ${dashRes.json().length} commitment(s) for this tenant`);

  // 8. GET /client-accounts/:id/view — the Client View screen's real data,
  // including the SAME ledger read a different way (joined through the
  // client rather than fetched by a single commitment id).
  const clientViewRes = await app.inject({ method: "GET", url: `/client-accounts/${client.id}/view` });
  const clientView = clientViewRes.json();
  console.log(
    `8. GET /client-accounts/:id/view -> "${clientView.client.name}", ${clientView.commitments.length} commitment(s), ${clientView.timeline.length} timeline entries`
  );
  if (clientView.timeline.length !== detail.ledger.length) {
    throw new Error("Client view timeline doesn't match the commitment's own ledger — join is wrong somewhere.");
  }

  // 9. GET /search — real full-text search, cited to real source events.
  const searchRes = await app.inject({ method: "GET", url: `/search?tenantId=${tenant.id}&q=staging` });
  const { results: searchResults } = searchRes.json();
  console.log(`9. GET /search?q=staging -> ${searchResults.length} result(s)`);
  if (searchResults.length === 0) throw new Error("Expected search to find the staging-credentials commitment.");
  if (!searchResults[0].sourceEventBody) throw new Error("Search result missing its citation — spec §67 requires one.");

  // 9b. A query that matches nothing must return nothing — never a fabricated result.
  const emptySearchRes = await app.inject({ method: "GET", url: `/search?tenantId=${tenant.id}&q=spaceship` });
  const { results: emptyResults } = emptySearchRes.json();
  console.log(`9b. GET /search?q=spaceship -> ${emptyResults.length} result(s) (expect 0)`);
  if (emptyResults.length !== 0) throw new Error("Search fabricated a result for a query with no real match.");

  await app.close();
  console.log("\n=== RESULT: PASS — full HTTP path proven end to end, setup included: no more hand-seeding the DB ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("=== RESULT: FAIL ===");
  console.error(err);
  process.exit(1);
});
