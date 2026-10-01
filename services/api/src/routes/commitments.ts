import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  captureSourceEvent,
  getSourceEvent,
  createCandidate,
  listCandidates,
  acceptCandidate,
  rejectCandidate,
  listCommitments,
  getCommitmentWithLedger,
  recordDueDateChange,
  markCommitmentWaiting,
  listWaitingItems,
  getClientView,
  CandidateNotFoundError,
  CandidateAlreadyResolvedError,
} from "../services/commitments.js";

const captureBody = z.object({
  tenantId: z.string().uuid(),
  kind: z.enum([
    "EMAIL",
    "MEETING_TRANSCRIPT",
    "AUDIO_TRANSCRIPT",
    "WHATSAPP_IMPORT",
    "SHARED_TEXT",
    "MANUAL_NOTE",
    "CALENDAR_EVENT",
    "WEB_CAPTURE",
  ]),
  body: z.string().min(1),
  occurredAt: z.string().datetime({ offset: true }),
  sourceAdapter: z.string().min(1),
});

const candidateBody = z.object({
  tenantId: z.string().uuid(),
  originEventId: z.string().uuid(),
  title: z.string().min(1),
  ownerHint: z.string().optional(),
  promisedToHint: z.string().optional(),
  clientHint: z.string().optional(),
  rawDatePhrase: z.string().optional(),
  anchor: z.string().datetime({ offset: true }),
  timezone: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

const acceptBody = z.object({
  acceptedBy: z.string().min(1),
});

const dueDateChangeBody = z.object({
  newDueAt: z.string().datetime({ offset: true }),
  initiatedBy: z.string().min(1),
  initiatorSide: z.enum(["US", "CLIENT", "SYSTEM", "UNKNOWN"]),
  reason: z.string().min(1),
  evidence: z.string().optional(),
  sourceEventId: z.string().uuid().optional(),
});

const waitingBody = z.object({
  waitingOn: z.string().min(1),
  waitingReason: z.string().optional(),
  initiatedBy: z.string().min(1),
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  // --- Source events (spec §13 — the universal capture pipeline) ---
  app.post("/source-events", async (req, reply) => {
    const parsed = captureBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const event = await captureSourceEvent({
      ...parsed.data,
      occurredAt: new Date(parsed.data.occurredAt),
    });
    return reply.code(201).send(event);
  });

  app.get("/source-events/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const event = await getSourceEvent(id);
    if (!event) return reply.code(404).send({ error: "source event not found" });
    return event;
  });

  // --- Candidates / review queue (spec §15, §28) ---
  app.post("/candidates", async (req, reply) => {
    const parsed = candidateBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { candidate, dateResolutionNote } = await createCandidate({
      ...parsed.data,
      anchor: new Date(parsed.data.anchor),
    });
    return reply.code(201).send({ candidate, dateResolutionNote });
  });

  app.get("/candidates", async (req, reply) => {
    const tenantId = (req.query as { tenantId?: string }).tenantId;
    if (!tenantId) return reply.code(400).send({ error: "tenantId query param is required" });
    return listCandidates(tenantId);
  });

  app.post("/candidates/:id/accept", async (req, reply) => {
    const parsed = acceptBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { id } = req.params as { id: string };
    try {
      const commitment = await acceptCandidate(id, parsed.data.acceptedBy);
      return reply.code(200).send(commitment);
    } catch (err) {
      if (err instanceof CandidateNotFoundError) return reply.code(404).send({ error: "candidate not found" });
      if (err instanceof CandidateAlreadyResolvedError) return reply.code(409).send({ error: err.message });
      throw err;
    }
  });

  app.post("/candidates/:id/reject", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const candidate = await rejectCandidate(id);
      return reply.code(200).send(candidate);
    } catch (err) {
      if (err instanceof CandidateNotFoundError) return reply.code(404).send({ error: "candidate not found" });
      throw err;
    }
  });

  // --- Commitments (spec §16, §65 dashboard data, §4.1 evidence/provenance) ---
  app.get("/commitments", async (req, reply) => {
    const tenantId = (req.query as { tenantId?: string }).tenantId;
    if (!tenantId) return reply.code(400).send({ error: "tenantId query param is required" });
    return listCommitments(tenantId);
  });

  app.get("/commitments/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = await getCommitmentWithLedger(id);
    if (!result) return reply.code(404).send({ error: "commitment not found" });
    return result;
  });

  // --- Client view (spec §66, design doc §5.6) ---
  app.get("/client-accounts/:id/view", async (req, reply) => {
    const { id } = req.params as { id: string };
    const view = await getClientView(id);
    if (!view) return reply.code(404).send({ error: "client account not found" });
    return view;
  });

  // --- Waiting items (spec §18 — responsibility sits with someone else) ---
  app.get("/waiting-items", async (req, reply) => {
    const tenantId = (req.query as { tenantId?: string }).tenantId;
    if (!tenantId) return reply.code(400).send({ error: "tenantId query param is required" });
    return listWaitingItems(tenantId);
  });

  app.post("/commitments/:id/waiting", async (req, reply) => {
    const parsed = waitingBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { id } = req.params as { id: string };
    try {
      const waitingItem = await markCommitmentWaiting({ commitmentId: id, ...parsed.data });
      return reply.code(201).send(waitingItem);
    } catch (err) {
      if (err instanceof CandidateNotFoundError) return reply.code(404).send({ error: "commitment not found" });
      throw err;
    }
  });

  app.post("/commitments/:id/due-date", async (req, reply) => {
    const parsed = dueDateChangeBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { id } = req.params as { id: string };
    try {
      const change = await recordDueDateChange({
        commitmentId: id,
        ...parsed.data,
        newDueAt: new Date(parsed.data.newDueAt),
      });
      return reply.code(201).send(change);
    } catch (err) {
      if (err instanceof CandidateNotFoundError) return reply.code(404).send({ error: "commitment not found" });
      throw err;
    }
  });
}
