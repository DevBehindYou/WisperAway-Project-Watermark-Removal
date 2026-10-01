import { db } from "../db/client.js";
import {
  sourceEvents,
  commitmentCandidates,
  commitments,
  commitmentChanges,
  waitingItems,
  clientAccounts,
  persons,
  type candidateStateEnum,
} from "../db/schema.js";
import { eq, and, ilike } from "drizzle-orm";
import { resolveDatePhrase } from "@keystone/date-resolution";
import crypto from "node:crypto";

/**
 * Shared business logic. Routes call these; so does smoke.ts. One place
 * for "what actually happens when a candidate is accepted" — spec §107
 * rules out duplicating domain logic across layers.
 */

export interface CaptureInput {
  tenantId: string;
  kind: string; // spec §13's SourceEvent kinds
  body: string;
  occurredAt: Date;
  sourceAdapter: string;
}

export async function captureSourceEvent(input: CaptureInput) {
  const checksum = crypto.createHash("sha256").update(input.body).digest("hex");
  const [event] = await db
    .insert(sourceEvents)
    .values({
      tenantId: input.tenantId,
      kind: input.kind,
      body: input.body,
      occurredAt: input.occurredAt,
      sourceAdapter: input.sourceAdapter,
      checksum,
    })
    .returning();
  return event;
}

export interface CreateCandidateInput {
  tenantId: string;
  originEventId: string;
  title: string;
  ownerHint?: string;
  promisedToHint?: string;
  clientHint?: string;
  rawDatePhrase?: string;
  /** The anchor moment + timezone the raw phrase should resolve against — normally the SourceEvent's occurredAt. */
  anchor: Date;
  timezone: string;
  confidence: number;
}

/**
 * Creates a candidate, running the phrase through the deterministic
 * resolver. There's no live model call in this environment (see
 * docs/STATE.md), so `modelResolvedDueAt` is left null here rather than
 * faked — spec §106 rules out pretending a call happened. A real
 * ModelAdapter call belongs here once one exists; the dual-resolution
 * *comparison* (spec §4.2) can't happen for real until it does.
 */
export async function createCandidate(input: CreateCandidateInput) {
  let deterministicResolvedDueAt: Date | null = null;
  let dateResolutionNote: string | null = null;

  if (input.rawDatePhrase) {
    const resolved = resolveDatePhrase({
      phrase: input.rawDatePhrase,
      anchor: input.anchor.toISOString().slice(0, 19),
      timezone: input.timezone,
    });
    if (resolved.kind === "resolved") {
      deterministicResolvedDueAt = new Date(resolved.resolvedUtc);
    } else {
      // needs_context or unrecognized — leave the date unset rather than
      // guess. The candidate still gets created; it just routes to
      // NEEDS_DATE_REVIEW instead of PENDING.
      dateResolutionNote = resolved.kind === "needs_context" ? resolved.reason : `Unrecognized phrase: "${resolved.raw}"`;
    }
  }

  const state: (typeof candidateStateEnum.enumValues)[number] = deterministicResolvedDueAt
    ? "PENDING"
    : input.rawDatePhrase
      ? "NEEDS_DATE_REVIEW"
      : "PENDING";

  const [candidate] = await db
    .insert(commitmentCandidates)
    .values({
      tenantId: input.tenantId,
      title: input.title,
      ownerHint: input.ownerHint,
      promisedToHint: input.promisedToHint,
      clientHint: input.clientHint,
      rawDatePhrase: input.rawDatePhrase,
      deterministicResolvedDueAt,
      confidence: input.confidence,
      state,
      originEventId: input.originEventId,
    })
    .returning();

  return { candidate, dateResolutionNote };
}

export async function getSourceEvent(id: string) {
  const [event] = await db.select().from(sourceEvents).where(eq(sourceEvents.id, id));
  return event ?? null;
}

export async function listCandidates(tenantId: string) {
  return db.select().from(commitmentCandidates).where(eq(commitmentCandidates.tenantId, tenantId));
}

export class CandidateNotFoundError extends Error {}
export class CandidateAlreadyResolvedError extends Error {}

/**
 * Simple exact-name (case-insensitive) lookup — a precursor to real
 * identity resolution (spec §12's PersonIdentity table), not that system
 * itself. Returns null rather than guessing when there's no clean match,
 * same "don't fabricate" rule as everywhere else in this codebase.
 */
async function resolveClientByHint(tenantId: string, hint: string | null | undefined) {
  if (!hint) return null;
  const [match] = await db
    .select()
    .from(clientAccounts)
    .where(and(eq(clientAccounts.tenantId, tenantId), ilike(clientAccounts.name, hint)));
  return match ?? null;
}

async function resolvePersonByHint(tenantId: string, hint: string | null | undefined) {
  if (!hint) return null;
  const [match] = await db
    .select()
    .from(persons)
    .where(and(eq(persons.tenantId, tenantId), ilike(persons.displayName, `%${hint}%`)));
  return match ?? null;
}

export async function acceptCandidate(candidateId: string, acceptedBy: string) {
  const [candidate] = await db
    .select()
    .from(commitmentCandidates)
    .where(eq(commitmentCandidates.id, candidateId));

  if (!candidate) throw new CandidateNotFoundError(candidateId);
  if (candidate.state === "ACCEPTED" || candidate.state === "REJECTED") {
    throw new CandidateAlreadyResolvedError(`Candidate ${candidateId} is already ${candidate.state}`);
  }

  // Resolve hints to real records where possible — this is what actually
  // makes Client View (grouping commitments by client) real instead of
  // silently empty. Unmatched hints stay null; they don't get guessed.
  const client = await resolveClientByHint(candidate.tenantId, candidate.clientHint);
  const counterpart = await resolvePersonByHint(candidate.tenantId, candidate.promisedToHint);

  const [commitment] = await db
    .insert(commitments)
    .values({
      tenantId: candidate.tenantId,
      title: candidate.title,
      promisedAt: candidate.createdAt,
      dueAt: candidate.deterministicResolvedDueAt,
      status: "OPEN",
      confidence: candidate.confidence,
      originEventId: candidate.originEventId,
      clientAccountId: client?.id,
      promisedToId: counterpart?.id,
    })
    .returning();

  await db.update(commitmentCandidates).set({ state: "ACCEPTED" }).where(eq(commitmentCandidates.id, candidateId));

  await db.insert(commitmentChanges).values({
    commitmentId: commitment.id,
    fieldName: "status",
    oldValue: null,
    newValue: "OPEN",
    initiatedBy: acceptedBy,
    initiatorSide: "US",
    sourceEventId: candidate.originEventId,
    reason: "Candidate reviewed and accepted.",
  });

  return commitment;
}

export async function rejectCandidate(candidateId: string) {
  const [candidate] = await db
    .select()
    .from(commitmentCandidates)
    .where(eq(commitmentCandidates.id, candidateId));
  if (!candidate) throw new CandidateNotFoundError(candidateId);
  const [updated] = await db
    .update(commitmentCandidates)
    .set({ state: "REJECTED" })
    .where(eq(commitmentCandidates.id, candidateId))
    .returning();
  return updated;
}

export async function listCommitments(tenantId: string) {
  return db.select().from(commitments).where(eq(commitments.tenantId, tenantId));
}

export async function getCommitmentWithLedger(commitmentId: string) {
  const [commitment] = await db.select().from(commitments).where(eq(commitments.id, commitmentId));
  if (!commitment) return null;
  const ledger = await db
    .select()
    .from(commitmentChanges)
    .where(eq(commitmentChanges.commitmentId, commitmentId))
    .orderBy(commitmentChanges.createdAt);
  return { commitment, ledger };
}

export async function recordDueDateChange(opts: {
  commitmentId: string;
  newDueAt: Date;
  initiatedBy: string;
  initiatorSide: "US" | "CLIENT" | "SYSTEM" | "UNKNOWN";
  reason: string;
  evidence?: string;
  sourceEventId?: string;
}) {
  const [current] = await db.select().from(commitments).where(eq(commitments.id, opts.commitmentId));
  if (!current) throw new CandidateNotFoundError(opts.commitmentId);

  const oldValue = current.dueAt?.toISOString() ?? null;
  await db.update(commitments).set({ dueAt: opts.newDueAt }).where(eq(commitments.id, opts.commitmentId));
  const [change] = await db
    .insert(commitmentChanges)
    .values({
      commitmentId: opts.commitmentId,
      fieldName: "due_at",
      oldValue,
      newValue: opts.newDueAt.toISOString(),
      initiatedBy: opts.initiatedBy,
      initiatorSide: opts.initiatorSide,
      reason: opts.reason,
      evidence: opts.evidence,
      sourceEventId: opts.sourceEventId,
    })
    .returning();
  return change;
}

/**
 * Marks a commitment WAITING (spec §18 — responsibility sits with someone
 * else now, distinct from BLOCKED). Creates a real waiting_items row and
 * a status-change ledger entry in one call, mirroring recordDueDateChange's
 * shape.
 */
export async function markCommitmentWaiting(opts: {
  commitmentId: string;
  waitingOn: string;
  waitingReason?: string;
  initiatedBy: string;
}) {
  const [current] = await db.select().from(commitments).where(eq(commitments.id, opts.commitmentId));
  if (!current) throw new CandidateNotFoundError(opts.commitmentId);

  const oldStatus = current.status;
  await db.update(commitments).set({ status: "WAITING" }).where(eq(commitments.id, opts.commitmentId));

  const [waitingItem] = await db
    .insert(waitingItems)
    .values({
      commitmentId: opts.commitmentId,
      waitingOn: opts.waitingOn,
      waitingReason: opts.waitingReason,
    })
    .returning();

  await db.insert(commitmentChanges).values({
    commitmentId: opts.commitmentId,
    fieldName: "status",
    oldValue: oldStatus,
    newValue: "WAITING",
    initiatedBy: opts.initiatedBy,
    initiatorSide: "US",
    reason: opts.waitingReason ?? `Now waiting on ${opts.waitingOn}.`,
  });

  return waitingItem;
}

/**
 * waiting_items has no tenant_id of its own (spec §11 doesn't give it
 * one) — tenant scoping goes through its parent commitment, so this is a
 * real join, not a flat select.
 */
export async function listWaitingItems(tenantId: string) {
  return db
    .select({
      id: waitingItems.id,
      commitmentId: waitingItems.commitmentId,
      commitmentTitle: commitments.title,
      waitingOn: waitingItems.waitingOn,
      waitingSince: waitingItems.waitingSince,
      waitingReason: waitingItems.waitingReason,
    })
    .from(waitingItems)
    .innerJoin(commitments, eq(waitingItems.commitmentId, commitments.id))
    .where(eq(commitments.tenantId, tenantId));
}

/**
 * Client View (design doc §5.6 / spec §66). The timeline is the whole
 * point of this screen — every ledger entry across every one of this
 * client's commitments, in one chronological read, immutable, no edit
 * affordance. Built from real joins across commitment_changes and
 * commitments; nothing here is synthesized.
 */
export async function getClientView(clientAccountId: string) {
  const [client] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, clientAccountId));
  if (!client) return null;

  const clientCommitments = await db
    .select()
    .from(commitments)
    .where(eq(commitments.clientAccountId, clientAccountId));

  const commitmentIds = clientCommitments.map((c) => c.id);
  let timeline: (typeof commitmentChanges.$inferSelect & { commitmentTitle: string })[] = [];

  if (commitmentIds.length > 0) {
    const rows = await db
      .select({
        id: commitmentChanges.id,
        commitmentId: commitmentChanges.commitmentId,
        commitmentTitle: commitments.title,
        fieldName: commitmentChanges.fieldName,
        oldValue: commitmentChanges.oldValue,
        newValue: commitmentChanges.newValue,
        initiatedBy: commitmentChanges.initiatedBy,
        initiatorSide: commitmentChanges.initiatorSide,
        sourceEventId: commitmentChanges.sourceEventId,
        evidence: commitmentChanges.evidence,
        reason: commitmentChanges.reason,
        createdAt: commitmentChanges.createdAt,
      })
      .from(commitmentChanges)
      .innerJoin(commitments, eq(commitmentChanges.commitmentId, commitments.id))
      .where(eq(commitments.clientAccountId, clientAccountId))
      .orderBy(commitmentChanges.createdAt);
    timeline = rows;
  }

  return { client, commitments: clientCommitments, timeline };
}
