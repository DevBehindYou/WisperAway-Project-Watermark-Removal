import type { FastifyInstance } from "fastify";
import { search } from "../services/search.js";

export async function registerSearchRoutes(app: FastifyInstance) {
  app.get("/search", async (req, reply) => {
    const { tenantId, q } = req.query as { tenantId?: string; q?: string };
    if (!tenantId) return reply.code(400).send({ error: "tenantId query param is required" });
    if (!q) return { results: [] };
    const results = await search(tenantId, q);
    return { results };
  });
}
