import Fastify from "fastify";
import { registerRoutes } from "./routes/commitments.js";
import { registerSetupRoutes } from "./routes/setup.js";
import { registerSearchRoutes } from "./routes/search.js";

export function buildApp() {
  const app = Fastify({ logger: false });
  app.register(registerSetupRoutes);
  app.register(registerRoutes);
  app.register(registerSearchRoutes);
  return app;
}

// Only actually listen when run directly (not when imported by the HTTP smoke test).
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 3000);
  app.listen({ port, host: "0.0.0.0" }).then(() => {
    console.log(`Keystone API listening on :${port}`);
  });
}
