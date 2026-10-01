import { db } from "../db/client.js";
import { commitments, sourceEvents } from "../db/schema.js";
import { and, eq, sql } from "drizzle-orm";

/**
 * Search (spec §67–68). What's actually built here: the SQL/full-text
 * layer spec §68 describes — real Postgres `to_tsvector`/`plainto_tsquery`
 * matching, nothing fabricated. What's NOT built: natural-language query
 * interpretation ("what did I promise last week" → a date-filtered
 * structured query) and embeddings-based semantic retrieval. Both need
 * either a real model call or substantial deterministic parsing this
 * pass didn't build. This searches on keywords, honestly, rather than
 * pretending to understand the question.
 *
 * Every result carries its source citation — spec §67 is explicit that
 * search must cite the underlying SourceEvent and must not answer
 * confidently without one. There is no synthesized "answer" here at
 * all, on purpose: just cited matches, so nothing here can be wrong in
 * the way a fabricated summary could be.
 */

export interface SearchResult {
  type: "commitment" | "source_event";
  id: string;
  title: string;
  snippet: string;
  sourceEventId: string;
  sourceEventBody: string;
  occurredAt: string;
}

export async function search(tenantId: string, query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const commitmentMatches = await db
    .select({
      id: commitments.id,
      title: commitments.title,
      detail: commitments.detail,
      sourceEventId: sourceEvents.id,
      sourceEventBody: sourceEvents.body,
      occurredAt: sourceEvents.occurredAt,
    })
    .from(commitments)
    .innerJoin(sourceEvents, eq(commitments.originEventId, sourceEvents.id))
    .where(
      and(
        eq(commitments.tenantId, tenantId),
        sql`to_tsvector('english', ${commitments.title} || ' ' || coalesce(${commitments.detail}, '')) @@ plainto_tsquery('english', ${trimmed})`
      )
    );

  const eventMatches = await db
    .select({
      id: sourceEvents.id,
      body: sourceEvents.body,
      occurredAt: sourceEvents.occurredAt,
    })
    .from(sourceEvents)
    .where(
      and(
        eq(sourceEvents.tenantId, tenantId),
        sql`to_tsvector('english', ${sourceEvents.body}) @@ plainto_tsquery('english', ${trimmed})`
      )
    );

  const results: SearchResult[] = [];

  for (const c of commitmentMatches) {
    results.push({
      type: "commitment",
      id: c.id,
      title: c.title,
      snippet: c.detail ?? c.title,
      sourceEventId: c.sourceEventId,
      sourceEventBody: c.sourceEventBody,
      occurredAt: c.occurredAt.toISOString(),
    });
  }

  // A source event that already matched via a commitment above is still
  // worth surfacing again as a raw evidence hit — different question
  // ("show me the conversation" vs "show me the commitment") — but skip
  // exact duplicates of the same event id to avoid a confusing double
  // listing of the identical text.
  const alreadyCited = new Set(commitmentMatches.map((c) => c.sourceEventId));
  for (const e of eventMatches) {
    if (alreadyCited.has(e.id)) continue;
    results.push({
      type: "source_event",
      id: e.id,
      title: e.body.slice(0, 80) + (e.body.length > 80 ? "…" : ""),
      snippet: e.body,
      sourceEventId: e.id,
      sourceEventBody: e.body,
      occurredAt: e.occurredAt.toISOString(),
    });
  }

  results.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  return results;
}
