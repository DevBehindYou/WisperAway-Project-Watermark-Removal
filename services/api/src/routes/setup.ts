import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createTenant,
  getOrCreateSingleTenant,
  createClientAccount,
  createPerson,
  listClientAccounts,
  listPersons,
} from "../services/setup.js";

const tenantBody = z.object({ name: z.string().min(1) });
const clientAccountBody = z.object({ tenantId: z.string().uuid(), name: z.string().min(1) });
const personBody = z.object({ tenantId: z.string().uuid(), displayName: z.string().min(1) });

export async function registerSetupRoutes(app: FastifyInstance) {
  // Single-tenant bootstrap (see getOrCreateSingleTenant's own comment for
  // why this isn't a login/session endpoint). apps/web calls this once on
  // load instead of minting its own tenant into localStorage.
  app.get("/workspace", async () => {
    return getOrCreateSingleTenant();
  });

  // Spec §63's first-run flow starts with "create workspace" — this is that,
  // minus everything OAuth-related, which is still blocked on ADR 0001.
  app.post("/tenants", async (req, reply) => {
    const parsed = tenantBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const tenant = await createTenant(parsed.data.name);
    return reply.code(201).send(tenant);
  });

  app.post("/client-accounts", async (req, reply) => {
    const parsed = clientAccountBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const client = await createClientAccount(parsed.data);
    return reply.code(201).send(client);
  });

  app.get("/client-accounts", async (req, reply) => {
    const tenantId = (req.query as { tenantId?: string }).tenantId;
    if (!tenantId) return reply.code(400).send({ error: "tenantId query param is required" });
    return listClientAccounts(tenantId);
  });

  app.post("/persons", async (req, reply) => {
    const parsed = personBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const person = await createPerson(parsed.data);
    return reply.code(201).send(person);
  });

  app.get("/persons", async (req, reply) => {
    const tenantId = (req.query as { tenantId?: string }).tenantId;
    if (!tenantId) return reply.code(400).send({ error: "tenantId query param is required" });
    return listPersons(tenantId);
  });
}
